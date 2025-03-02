import mongoose, { Schema, Document, Types } from "mongoose";
import { UserRole } from "../../../../domain/entities/User";

export interface SocialMediaDocument {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface AddressDocument {
  country: string; // Ülke ID'si
  state: string; // Eyalet ID'si
  city: string; // Şehir ID'si
  street: string; // Cadde
  number: string; // Numara
  postalCode: string; // Posta kodu
}

export interface CompanyInfoDocument {
  name: string;
  logo?: string;
  address: AddressDocument;
  benefits: string[];
  socialMedia?: SocialMediaDocument;
}

export interface LocationDocument {
  latitude: string;
  longitude: string;
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  company: CompanyInfoDocument;
  location: LocationDocument;
  isFake: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Sosyal Medya için schema
const SocialMediaSchema = new Schema(
  {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
  },
  { _id: false }
);

// Adres için schema
const AddressSchema = new Schema(
  {
    country: { type: String, default: "" }, // Ülke ID'si
    state: { type: String, default: "" }, // Eyalet ID'si
    city: { type: String, default: "" }, // Şehir ID'si
    street: { type: String, default: "" }, // Cadde
    number: { type: String, default: "" }, // Numara
    postalCode: { type: String, default: "" }, // Posta kodu
  },
  { _id: false }
);

// Company için schema
const CompanySchema = new Schema(
  {
    name: { type: String, default: "" },
    logo: { type: String, default: "" },
    address: { type: AddressSchema, default: () => ({}) },
    benefits: [{ type: String }],
    socialMedia: { type: SocialMediaSchema, default: () => ({}) },
  },
  { _id: false }
);

// Location için schema
const LocationSchema = new Schema(
  {
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MERCHANT,
    },
    company: { type: CompanySchema, default: () => ({}) },
    location: { type: LocationSchema, default: () => ({}) },
    isFake: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexler
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ "company.name": 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ "company.address.country": 1 });
UserSchema.index({ "company.address.state": 1 });
UserSchema.index({ "company.address.city": 1 });

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
