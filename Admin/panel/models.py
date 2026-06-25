from django.db import models


class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Subcategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email


# Listing model kept unchanged as requested
class Listing(models.Model):
    id = models.BigAutoField(primary_key=True)
    # The rest of Listing fields are expected to remain as in the panel implementation
    # Keep a minimal set to reflect existing structure
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    subcategory = models.ForeignKey(Subcategory, on_delete=models.RESTRICT, related_name='listings')
    title = models.CharField(max_length=255)
    price = models.BigIntegerField()
    condition = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='active')
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    brand = models.CharField(max_length=255, blank=True, null=True)
    model = models.CharField(max_length=255, blank=True, null=True)
    year = models.BigIntegerField(blank=True, null=True)
    mileage = models.BigIntegerField(blank=True, null=True)
    color = models.CharField(max_length=100, blank=True, null=True)
    engine_volume = models.FloatField(blank=True, null=True)
    fuel_type = models.CharField(max_length=100, blank=True, null=True)
    transmission = models.CharField(max_length=100, blank=True, null=True)
    drive_type = models.CharField(max_length=100, blank=True, null=True)
    body_type = models.CharField(max_length=100, blank=True, null=True)
    battery_capacity = models.CharField(max_length=100, blank=True, null=True)
    power_reserve = models.BigIntegerField(blank=True, null=True)
    motor_power = models.BigIntegerField(blank=True, null=True)
    frame_size = models.CharField(max_length=100, blank=True, null=True)
    wheel_size = models.FloatField(blank=True, null=True)
    frame_material = models.CharField(max_length=100, blank=True, null=True)
    speed_count = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ListingMedia(models.Model):
    id = models.BigAutoField(primary_key=True)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='media')
    url = models.URLField(max_length=255)
    sort_order = models.BigIntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.listing.title} media {self.sort_order}'


class SavedListing(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_listings')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Saved Listing'
        verbose_name_plural = 'Saved Listings'

    def __str__(self):
        return f'Saved {self.listing.title} by {self.user.email}'


class Conversation(models.Model):
    id = models.BigAutoField(primary_key=True)
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_seller')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_buyer')
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Conversation {self.id}'


class Message(models.Model):
    id = models.BigAutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    body = models.TextField()
    type = models.CharField(max_length=50, default='text')
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message {self.id} in {self.conversation.id}'
