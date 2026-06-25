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
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    search_fields = ('name',)
    list_filter = ('category',)
    


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'subcategory', 'price', 'status', 'created_at')
    search_fields = ('title', 'description', 'brand', 'model')
    list_filter = ('status', 'condition', 'subcategory', 'created_at')
    inlines = (ListingMediaInline,)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone', 'is_active', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    list_filter = ('is_active', 'is_deleted')


@admin.register(SavedListing)
class SavedListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')
    search_fields = ('user__first_name', 'user__last_name', 'listing__title')


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'seller', 'buyer', 'created_at', 'last_message_at')
    search_fields = ('seller__first_name', 'seller__last_name', 'buyer__first_name', 'buyer__last_name', 'listing__title')
    inlines = (MessageInline,)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'type', 'is_read', 'sent_at')
    search_fields = ('body', 'sender__first_name', 'sender__last_name')
    list_filter = ('type', 'is_read')
 
