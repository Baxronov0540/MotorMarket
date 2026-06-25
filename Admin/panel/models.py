import uuid

from django.db import models


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(blank=True, null=True)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name or self.email


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    icon = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Subcategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Listing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    subcategory = models.ForeignKey(Subcategory, on_delete=models.RESTRICT, related_name='listings')
    title = models.CharField(max_length=255)
    price = models.BigIntegerField()
    condition = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='active')
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    make = models.CharField(max_length=255, blank=True, null=True)
    model = models.CharField(max_length=255, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    mileage = models.IntegerField(blank=True, null=True)
    color = models.CharField(max_length=100, blank=True, null=True)
    engine_volume = models.FloatField(blank=True, null=True)
    fuel_type = models.CharField(max_length=100, blank=True, null=True)
    transmission = models.CharField(max_length=100, blank=True, null=True)
    drive_type = models.CharField(max_length=100, blank=True, null=True)
    body_type = models.CharField(max_length=100, blank=True, null=True)
    battery_capacity = models.CharField(max_length=100, blank=True, null=True)
    power_reserve = models.IntegerField(blank=True, null=True)
    motor_power = models.IntegerField(blank=True, null=True)
    frame_size = models.CharField(max_length=100, blank=True, null=True)
    wheel_size = models.FloatField(blank=True, null=True)
    frame_material = models.CharField(max_length=100, blank=True, null=True)
    speed_count = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ListingMedia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='media')
    url = models.URLField()
    sort_order = models.IntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.listing.title} media {self.sort_order}'


class SavedListing(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_listings')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Saved Listing'
        verbose_name_plural = 'Saved Listings'

    def __str__(self):
        return f'Saved {self.listing.title} by {self.user.full_name or self.user.email}'


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_seller')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_buyer')
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Conversation {self.id}'


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    body = models.TextField()
    type = models.CharField(max_length=50, default='text')
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message {self.id} in {self.conversation.id}'
