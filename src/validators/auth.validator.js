import { body } from "express-validator";

export const registerValidation = [
  // fullName must not be empty
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required."),

  // phoneNumber must be a valid phone number
  body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required.")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Must be a valid phone number."),

  // password must be at least 6 chars long
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  // gender must be one of the allowed values
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender is required and must be a valid option."),

  // dateOfBirth must be a valid date
  body("dateOfBirth")
    .isISO8601()
    .toDate()
    .withMessage("Date of birth must be a valid date."),

  // profileCreatedFor must not be empty
  body("profileCreatedFor")
    .trim()
    .notEmpty()
    .withMessage("Profile created for is required."),
];
