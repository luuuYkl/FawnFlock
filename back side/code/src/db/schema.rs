// @generated automatically by Diesel CLI.

diesel::table! {
    comments (comment_id) {
        comment_id -> Integer,
        post_id -> Nullable<Integer>,
        user_id -> Nullable<Integer>,
        comment -> Text,
        created_at -> Nullable<Datetime>,
    }
}

diesel::table! {
    likes (post_id, user_id) {
        post_id -> Integer,
        user_id -> Integer,
        like_date -> Nullable<Datetime>,
    }
}

diesel::table! {
    posts (post_id) {
        post_id -> Integer,
        user_id -> Nullable<Integer>,
        content -> Nullable<Text>,
        #[max_length = 255]
        image_url -> Nullable<Varchar>,
        #[max_length = 255]
        video_url -> Nullable<Varchar>,
        #[max_length = 255]
        audio_url -> Nullable<Varchar>,
        #[max_length = 255]
        title -> Nullable<Varchar>,
        like_count -> Nullable<Integer>,
        comment_count -> Nullable<Integer>,
        created_at -> Nullable<Datetime>,
        updated_at -> Nullable<Datetime>,
    }
}

diesel::table! {
    users (user_id) {
        user_id -> Integer,
        #[max_length = 255]
        username -> Varchar,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 255]
        password -> Varchar,
        #[max_length = 20]
        phone -> Nullable<Varchar>,
        #[max_length = 255]
        avatar_url -> Nullable<Varchar>,
        bio -> Nullable<Text>,
        voice_fingerprint -> Nullable<Text>,
        created_at -> Nullable<Datetime>,
        updated_at -> Nullable<Datetime>,
    }
}

diesel::joinable!(comments -> posts (post_id));
diesel::joinable!(comments -> users (user_id));
diesel::joinable!(likes -> posts (post_id));
diesel::joinable!(likes -> users (user_id));
diesel::joinable!(posts -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    comments,
    likes,
    posts,
    users,
);
