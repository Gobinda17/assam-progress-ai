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

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ status: 'fail',message: "Invalid credentials" });

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
