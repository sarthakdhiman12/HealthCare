package com.edutech.healthcare_appointment_management_system.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class TimeDto {

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date time;

    public TimeDto() {
    }

    public TimeDto(Date time) {
        this.time = time;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }
}