import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'
const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      maxlength: 50,
      minlength: 3,
      required: [true, 'Please provide name']
    },
    last_name: {
      type: String,
      required: [true, 'Please provide name'],
      maxlength: 50,
      minlength: 3
    },
    profile_picture: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide valid email'
      }
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)

  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
