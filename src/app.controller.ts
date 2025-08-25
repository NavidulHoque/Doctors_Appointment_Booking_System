import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {

    @Get("/")
    welcome(){
        return "Welcome to Doctors Appointment Management System"
    }
}
