import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  verifyAccess,
} from "../utils/jwt.js";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);

    // MVP rule: first user becomes SUPERADMIN (optional but handy)
    const count = await User.countDocuments();
    const role = count === 0 ? "SUPERADMIN" : "USER";

    const user = await User.create({ name, email, passwordHash, role });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Contact admin." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ status: 'fail', message: "Invalid credentials" });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .select("_id name email role")
      .lean();
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let decoded;
    try {
      decoded = verifyRefresh(token);
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash)
      return res.status(401).json({ message: "Unauthorized" });

    if (user.status === "inactive") {
      return res.status(403).json({ message: "Account is inactive. Contact admin." });
    }

    const match = await bcrypt.compare(token, user.refreshTokenHash);
    if (!match) return res.status(401).json({ message: "Unauthorized" });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ok: true,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.access_token;

    if (token) {
      // best-effort invalidate
      try {
        const decoded = verifyAccess(token);
        await User.updateOne(
          { _id: decoded.userId },
          { $set: { refreshTokenHash: null } },
        );
      } catch (err) {
        console.error("Error invalidating access token:", err);
        res.status(500).json({ message: "Error invalidating access token" });
      }
    }

    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let decoded;
    try {
      decoded = verifyAccess(token);
    } catch (err) {
      console.error("Error verifying access token:", err);
      res.status(500).json({ message: "Error verifying access token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid current password" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function userList(req, res) {
  try {
    const users = await User.find().select("_id name email role status createdAt").lean();
    res.json({ users });
  } catch (error) {
    console.error("User list error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { userId, newRole } = req.body || {};
    
    if (!userId || !newRole) {
      return res.status(400).json({ message: "Missing userId or newRole" });
    }

    if (!["SUPERADMIN", "USER"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Only SUPERADMIN can update roles
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safeguard: if target is SUPERADMIN and trying to change to USER
    if (targetUser.role === "SUPERADMIN" && newRole === "USER") {
      // Count remaining SUPERADMINs after this change
      const superadminCount = await User.countDocuments({ role: "SUPERADMIN" });
      
      if (superadminCount === 1) {
        return res.status(409).json({
          message: "Cannot demote the last SUPERADMIN. Promote another user first.",
        });
      }
    }

    targetUser.role = newRole;
    await targetUser.save();

    res.json({
      message: "Role updated successfully",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { userId, newStatus } = req.body || {};
    
    if (!userId || !newStatus) {
      return res.status(400).json({ message: "Missing userId or newStatus" });
    }

    if (!["active", "inactive"].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Only SUPERADMIN can update status
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safeguard: prevent deactivating the last SUPERADMIN
    if (targetUser.role === "SUPERADMIN" && newStatus === "inactive") {
      const superadminCount = await User.countDocuments({ role: "SUPERADMIN" });
      if (superadminCount === 1) {
        return res.status(409).json({
          message: "Cannot deactivate the last SUPERADMIN. Promote another user first.",
        });
      }
    }

    targetUser.status = newStatus;
    await targetUser.save();

    res.json({
      message: "Status updated successfully",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUserById(req, res) {
  try {
    const { userId } = req.params;

    // Only SUPERADMIN can delete users
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safeguard: prevent deleting the last SUPERADMIN
    if (targetUser.role === "SUPERADMIN") {
      const superadminCount = await User.countDocuments({ role: "SUPERADMIN" });
      if (superadminCount === 1) {
        return res.status(409).json({
          message: "Cannot delete the last SUPERADMIN. Promote another user first.",
        });
      }
    }

    await User.deleteOne({ _id: userId });

    res.json({
      message: "User deleted successfully",
      deletedUserId: userId,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
