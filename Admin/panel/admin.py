from django.contrib import admin

from .models import (
    Category,
    Conversation,
    Listing,
    ListingMedia,
    SavedListing,
    Subcategory,
    User,
    Message,
)


class ListingMediaInline(admin.TabularInline):
    model = ListingMedia
    extra = 1


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('sent_at',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'slug', 'created_at')
    search_fields = ('name', 'slug')
    list_filter = ('category',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'subcategory', 'price', 'status', 'created_at')
    search_fields = ('title', 'description', 'make', 'model')
    list_filter = ('status', 'condition', 'subcategory', 'created_at')
    inlines = (ListingMediaInline,)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'role', 'rating', 'review_count', 'created_at')
    search_fields = ('full_name', 'email', 'phone')
    list_filter = ('role',)


@admin.register(SavedListing)
class SavedListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')
    search_fields = ('user__full_name', 'listing__title')


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'seller', 'buyer', 'created_at', 'last_message_at')
    search_fields = ('seller__full_name', 'buyer__full_name', 'listing__title')
    inlines = (MessageInline,)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'type', 'is_read', 'sent_at')
    search_fields = ('body', 'sender__full_name')
    list_filter = ('type', 'is_read')
