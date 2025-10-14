export class DoctorResponseDto {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly avatarImage?: string;
  readonly specialization: string;
  readonly education: string;
  readonly experience: number;
  readonly aboutMe: string;
  readonly fees: number;
  readonly availableTimes: string[];
  readonly isActive: boolean;

  constructor(doctor: Record<string, any>) {
    this.id = doctor.userId;
    this.fullName = doctor.user.fullName;
    this.email = doctor.user.email;
    this.avatarImage = doctor.user.avatarImage;
    this.specialization = doctor.specialization;
    this.education = doctor.education;
    this.experience = doctor.experience;
    this.aboutMe = doctor.aboutMe;
    this.fees = doctor.fees;
    this.availableTimes = doctor.availableTimes;
    this.isActive = doctor.isActive;
  }
}