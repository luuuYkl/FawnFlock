// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::sql_types::SqlType)]
    #[diesel(mysql_type(name = "Enum"))]
    pub struct MessagesMessageTypeEnum;

    #[derive(diesel::sql_types::SqlType)]
    #[diesel(mysql_type(name = "Enum"))]
    pub struct NotificationsNotificationTypeEnum;

    #[derive(diesel::sql_types::SqlType)]
    #[diesel(mysql_type(name = "Enum"))]
    pub struct PrivacySettingsMessagePrivacyEnum;

    #[derive(diesel::sql_types::SqlType)]
    #[diesel(mysql_type(name = "Enum"))]
    pub struct PrivacySettingsProfileVisibilityEnum;
}

diesel::table! {
    a (account) {
        #[max_length = 255]
        account -> Varchar,
        #[max_length = 255]
        psd -> Varchar,
    }
}

diesel::table! {
    comments (comment_id) {
        comment_id -> Integer,
        post_id -> Nullable<Integer>,
        user_id -> Nullable<Integer>,
        comment -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    course (id) {
        id -> Integer,
        #[max_length = 50]
        name -> Varchar,
        credit -> Float,
        #[sql_name = "type"]
        type_ -> Integer,
    }
}

diesel::table! {
    course_arrange (id) {
        id -> Integer,
        teacher_id -> Integer,
        course_id -> Integer,
        #[max_length = 100]
        course_time -> Varchar,
        #[max_length = 100]
        course_place -> Varchar,
        max_num -> Integer,
        selected_num -> Integer,
    }
}

diesel::table! {
    follows (follower_id, following_id) {
        follower_id -> Integer,
        following_id -> Integer,
        follow_date -> Nullable<Timestamp>,
    }
}

diesel::table! {
    likes (post_id, user_id) {
        post_id -> Integer,
        user_id -> Integer,
        like_date -> Nullable<Timestamp>,
    }
}

diesel::table! {
    live_comments (comment_id) {
        comment_id -> Integer,
        session_id -> Nullable<Integer>,
        user_id -> Nullable<Integer>,
        comment -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    live_sessions (session_id) {
        session_id -> Integer,
        user_id -> Nullable<Integer>,
        #[max_length = 255]
        session_title -> Nullable<Varchar>,
        #[max_length = 255]
        stream_url -> Nullable<Varchar>,
        start_time -> Nullable<Timestamp>,
        end_time -> Nullable<Timestamp>,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::MessagesMessageTypeEnum;

    messages (message_id) {
        message_id -> Integer,
        sender_id -> Nullable<Integer>,
        receiver_id -> Nullable<Integer>,
        content -> Nullable<Text>,
        #[max_length = 5]
        message_type -> Nullable<MessagesMessageTypeEnum>,
        sent_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::NotificationsNotificationTypeEnum;

    notifications (notification_id) {
        notification_id -> Integer,
        user_id -> Nullable<Integer>,
        #[max_length = 7]
        notification_type -> Nullable<NotificationsNotificationTypeEnum>,
        triggered_by -> Nullable<Integer>,
        post_id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
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
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        like_count -> Nullable<Integer>,
        comment_count -> Nullable<Integer>,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::PrivacySettingsProfileVisibilityEnum;
    use super::sql_types::PrivacySettingsMessagePrivacyEnum;

    privacy_settings (user_id) {
        user_id -> Integer,
        #[max_length = 7]
        profile_visibility -> Nullable<PrivacySettingsProfileVisibilityEnum>,
        #[max_length = 8]
        message_privacy -> Nullable<PrivacySettingsMessagePrivacyEnum>,
    }
}

diesel::table! {
    recommendations (recommendation_id) {
        recommendation_id -> Integer,
        user_id -> Nullable<Integer>,
        post_id -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    search_history (search_id) {
        search_id -> Integer,
        user_id -> Nullable<Integer>,
        #[max_length = 255]
        search_query -> Nullable<Varchar>,
        search_date -> Nullable<Timestamp>,
    }
}

diesel::table! {
    select_result (id) {
        id -> Integer,
        course_arrange_id -> Integer,
        student_id -> Integer,
        select_time -> Datetime,
    }
}

diesel::table! {
    short_videos (video_id) {
        video_id -> Integer,
        user_id -> Nullable<Integer>,
        #[max_length = 255]
        video_url -> Nullable<Varchar>,
        #[max_length = 255]
        thumbnail_url -> Nullable<Varchar>,
        duration -> Nullable<Integer>,
        created_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    tequipment (id) {
        id -> Integer,
        #[max_length = 50]
        name -> Nullable<Varchar>,
        #[max_length = 255]
        description -> Nullable<Varchar>,
        #[max_length = 100]
        code -> Nullable<Varchar>,
        add_time -> Nullable<Datetime>,
        price -> Nullable<Float>,
        #[max_length = 255]
        place -> Nullable<Varchar>,
        user_Id -> Nullable<Integer>,
    }
}

diesel::table! {
    tuser (id) {
        id -> Integer,
        #[max_length = 50]
        loginName -> Varchar,
        #[max_length = 50]
        real_name -> Nullable<Varchar>,
        #[max_length = 50]
        password -> Varchar,
        #[max_length = 50]
        tel -> Nullable<Varchar>,
        #[max_length = 50]
        email -> Nullable<Varchar>,
        #[sql_name = "type"]
        type_ -> Tinyint,
        last_login_time -> Nullable<Datetime>,
    }
}

diesel::table! {
    user (id) {
        id -> Integer,
        #[max_length = 50]
        login_name -> Varchar,
        #[max_length = 50]
        password -> Varchar,
        #[max_length = 50]
        real_name -> Varchar,
        #[sql_name = "type"]
        type_ -> Tinyint,
    }
}

diesel::table! {
    users (user_id) {
        user_id -> Integer,
        #[max_length = 50]
        username -> Varchar,
        #[max_length = 100]
        email -> Varchar,
        #[max_length = 255]
        password -> Varchar,
        #[max_length = 15]
        phone -> Nullable<Varchar>,
        #[max_length = 255]
        avatar_url -> Nullable<Varchar>,
        bio -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    voice_chat_sessions (session_id) {
        session_id -> Integer,
        user1_id -> Nullable<Integer>,
        user2_id -> Nullable<Integer>,
        start_time -> Nullable<Timestamp>,
        end_time -> Nullable<Timestamp>,
    }
}

diesel::table! {
    voice_messages (message_id) {
        message_id -> Integer,
        sender_id -> Nullable<Integer>,
        receiver_id -> Nullable<Integer>,
        #[max_length = 255]
        audio_url -> Nullable<Varchar>,
        duration -> Nullable<Integer>,
        sent_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(course_arrange -> course (course_id));
diesel::joinable!(select_result -> course_arrange (course_arrange_id));
diesel::joinable!(select_result -> user (student_id));

diesel::allow_tables_to_appear_in_same_query!(
    a,
    comments,
    course,
    course_arrange,
    follows,
    likes,
    live_comments,
    live_sessions,
    messages,
    notifications,
    posts,
    privacy_settings,
    recommendations,
    search_history,
    select_result,
    short_videos,
    tequipment,
    tuser,
    user,
    users,
    voice_chat_sessions,
    voice_messages,
);
