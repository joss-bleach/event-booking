const bcrypt = require("bcryptjs");

// Mongoose Models
const Event = require("../../models/Event");
const User = require("../../models/User");
const Booking = require("../../models/Booking");

// Helper Functions

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: toDate(event._doc.date),
        creator: user.bind(this, event.creator),
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEcents),
    };
  } catch (err) {
    throw err;
  }
};

const toDate = (date) => {
  return new Date(date).toISOString();
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: toDate(booking.createdAt),
          updatedAt: toDate(booking.updatedAt),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          date: toDate(event.date),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  // Create and event
  createEvent: async (args) => {
    try {
      const { title, description, price, date } = args.eventInput;

      const event = new Event({
        title: title,
        description: description,
        price: +price,
        date: new Date(date),
        creator: "5f294bfdcef84b0982bd11fd",
      });

      let createdEvent;
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: toDate(event._doc.date),
        creator: user.bind(this, result._doc.creator),
      };

      const user = await User.findById("5f294bfdcef84b0982bd11fd");
      if (!user) {
        throw new Error("User not found.");
      }

      user.createdEvent.push(event);
      await user.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      const { email, password } = args.userInput;
      const user = await User.findOne({ email: email });
      if (user) {
        throw new Error("User already exists.");
      }

      const newUser = new User({
        email: email,
        password: password,
      });

      const salt = await bcrypt.genSalt(12);
      const hashPassword = await bycrypt.hash(password, salt);
      newUser.password = hashPassword;

      const result = newUser.save();

      return {
        ...result._doc,
        password: null,
        _id: result.id,
      };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5f294bfdcef84b0982bd11fd",
      event: fetchedEvent,
    });

    const result = await booking.save();

    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: toDate(result._doc.createdAt),
      updatedAt: toDate(result._doc.updatedAt),
    };
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator),
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  },
};
