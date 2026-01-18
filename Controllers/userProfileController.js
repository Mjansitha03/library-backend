import User from "../Models/userSchema.js";

//Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone role activity createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


//Update My Profile 
export const updateMyProfile = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { phone },
      {
        new: true,
        runValidators: true,
        select: "name email phone role activity",
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
