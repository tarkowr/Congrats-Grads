export const app = {
    maxUploads: 3,
    maxImageSize: 3 * 1024 * 1024,
    startYear: 2020,
    currentYear: 2021,
    snackbarTimeout: 3000,
    newsUpdates: 11,
}

export const regex = {
    name: /^[.a-zA-Z0-9 \-]{1,20}$/,
    school: /^[.a-zA-Z0-9 \-]{1,40}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/,
    search: /^[a-zA-Z0-9 \-]{1,50}$/
}

export const storage = {
    userId: 'user_id',
    uploads: 'uploaded',
    visits: 'visited_pages',
    seenNewsUpdates: 'seen_news_updates',
}

export const analytics = {
    insta: 'insta_btn',
    facebook: 'fb_btn'
}
