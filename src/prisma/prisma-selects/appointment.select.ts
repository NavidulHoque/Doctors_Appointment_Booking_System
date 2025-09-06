export const appointmentSelect = {
    id: true,
    doctor: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarImage: true,
            doctor: {
                select: {
                    fees: true
                }
            }
        }
    },
    patient: {
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarImage: true
        },
    },
    date: true,
    status: true,
    cancellationReason: true,
    isPaid: true,
    paymentMethod: true
}