from django.db import models


class Vehicle(models.Model):
    make = models.CharField(max_length=64)
    model = models.CharField(max_length=64)
    license_plate = models.CharField(max_length=16, unique=True)
    capacity = models.PositiveIntegerField()
    location = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"


class Booking(models.Model):
    user = models.ForeignKey(
        "auth.User", on_delete=models.CASCADE, related_name="bookings"
    )
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="bookings")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("confirmed", "Confirmed"), ("canceled", "Canceled")],
        default="pending",
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.user} → {self.vehicle} ({self.start_time}‑{self.end_time})"
