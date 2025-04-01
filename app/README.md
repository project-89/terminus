# Project 89 App Structure

## Overview

The Project 89 application consists of a full-screen video landing page that serves as the primary experience.

## Structure

- `/` - Landing page with full-screen trailer video

## Components

### VideoLanding

Located at: `app/components/VideoLanding.tsx`

- Full-screen video component for the landing page
- Displays project89_trailer.mp4 from the public/media directory
- Video loops automatically

## Video Requirements

- The trailer video should be placed at: `public/media/project89_trailer.mp4`
- Format: MP4 (H.264 codec)
- Recommended resolution: 1080p minimum
- The video will loop continuously

## Development Notes

- When updating the video, ensure it's optimized for web delivery
- Test autoplay functionality across different browsers
- The video is muted by default to ensure autoplay works in most browsers
- Video controls are enabled for user interaction
