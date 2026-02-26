import mongoose from "mongoose";

// const photoSchema = new mongoose.Schema({
//   photoUrl: { type: String, required: true },
//   status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" }
// });
const photoSchema = new mongoose.Schema({
  photoUrl: { type: String, required: true },
  s3Key: { type: String, required: true },
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  isPrimary: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
});


const educationSchema = new mongoose.Schema({
  highestEducation: String,
  educationField: String,
  institutionName: String,
});

const professionalSchema = new mongoose.Schema({
  occupation: String,
  organizationName: String,
  annualIncomeMin: Number,
  annualIncomeMax: Number,
});

const familySchema = new mongoose.Schema({
  fatherName: String,
  fatherOccupation: String,
  motherName: String,
  motherOccupation: String,
  brothers: { type: Number, default: 0 },
  sisters: { type: Number, default: 0 },
  familyType: { type: String },
  currentResidenceCity: String,
  currentResidenceState: String,
});

const lifestyleSchema = new mongoose.Schema({
  diet: String,
  smoking: Boolean,
  drinking: Boolean,
  hobbies: [String],
  aboutMe: String,
  partnerExpectations: String,
});

const religiousSchema = new mongoose.Schema({
  religion: String,
  caste: String,
  subCaste: String,
  manglik: Boolean,
});

const personalSchema = new mongoose.Schema({
  heightCm: Number,
  maritalStatus: { type: String, enum: ["never_married", "divorced", "widowed", "awaiting_divorce"], default: "never_married" },
  motherTongue: String,
});

const subscriptionSchema = new mongoose.Schema({
  tier: { type: String, enum: ["free", "silver", "gold", "platinum"], default: "free" },
  expiryDate: Date,
});

const searchPreferencesSchema = new mongoose.Schema({
  gender: { type: String, default: "" },
  state: { type: String, default: "" },
  religion: { type: String, default: "" },
  maritalStatus: { type: String, default: "" },
  diet: { type: String, default: "" },
  ageMin: { type: String, default: "" },
  ageMax: { type: String, default: "" },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dateOfBirth: { type: Date, required: true },
  profileCreatedFor: { type: String },
  photos: [photoSchema],
  personalDetails: personalSchema,
  religiousDetails: religiousSchema,
  educationDetails: educationSchema,
  professionalDetails: professionalSchema,
  familyDetails: familySchema,
  lifestylePreferences: lifestyleSchema,
  searchPreferences: searchPreferencesSchema,
  subscription: subscriptionSchema,
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
