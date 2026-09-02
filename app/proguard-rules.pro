# Add project specific ProGuard rules here.
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
-keep class com.smartteacher.schedule.core.model.** { *; }
-dontwarn com.google.crypto.tink.**
