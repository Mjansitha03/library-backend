import Announcement from "../Models/announcementSchema.js";
import User from "../Models/userSchema.js";
import Notification from "../Models/notificationSchema.js";

// Create Announcement 
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetUsers } = req.body;
    const role = req.user.role;

    if (role === "admin" && targetUsers?.length > 0) {
      return res.status(400).json({
        message: "Admin can only create global announcements.",
      });
    }

    if (role === "librarian" && (!targetUsers || targetUsers.length === 0)) {
      return res.status(400).json({
        message: "Librarian must select specific users for the announcement.",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
      targetUsers: targetUsers || [],
    });

    const usersToNotify =
      targetUsers?.length > 0
        ? targetUsers
        : role === "admin"
        ? (await User.find({}, "_id")).map((u) => u._id)
        : [];

    await Notification.insertMany(
      usersToNotify.map((user) => ({
        user,
        title,
        message,
        createdBy: req.user._id,
      }))
    );

    res.status(201).json(announcement);
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Admin Announcements Only 
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ targetUsers: { $size: 0 } })
      .populate("createdBy", "name email role") 
      .sort({ createdAt: -1 });

    const adminAnnouncements = announcements.filter(
      (a) => a.createdBy.role === "admin"
    );

    res.status(200).json(adminAnnouncements);
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ message: error.message });
  }
};

//Delete Announcement 
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
