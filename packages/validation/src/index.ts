export { envSchema } from './env.schema';
export type { Env } from './env.schema';

export {
	appointmentStatusSchema,
	genderSchema,
	paymentStatusSchema,
	paymentMethodSchema,
	otpTypeSchema,
	weekDaysSchema,
} from './enums';

export { PaginationSchema } from './common';
export type { TPagination } from './common';

export { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, VerifyOtpSchema, RefreshTokenSchema } from './auth';
export type { TRegister, TLogin, TForgotPassword, TResetPassword, TVerifyOtp, TRefreshToken } from './auth';

export { CreateAppointmentSchema, UpdateAppointmentSchema, QueryAppointmentSchema } from './appointment';
export type { TCreateAppointment, TUpdateAppointment, TQueryAppointment } from './appointment';

export { CreateDoctorSchema, UpdateDoctorSchema, QueryDoctorSchema } from './doctor';
export type { TCreateDoctor, TUpdateDoctor, TQueryDoctor } from './doctor';

export { UpdateUserSchema } from './user';
export type { TUpdateUser } from './user';

export { CreateMessageSchema, UpdateMessageSchema } from './message';
export type { TCreateMessage, TUpdateMessage } from './message';

export { QueryNotificationSchema } from './notification';
export type { TQueryNotification } from './notification';

export { CreatePaymentSchema, QueryPaymentHistorySchema } from './payment';
export type { TCreatePayment, TQueryPaymentHistory } from './payment';

export { CreateReviewSchema } from './review';
export type { TCreateReview } from './review';

export { RequestAvatarUploadSchema, ConfirmAvatarUploadSchema } from './uploads';
export type { TRequestAvatarUpload, TConfirmAvatarUpload } from './uploads';
