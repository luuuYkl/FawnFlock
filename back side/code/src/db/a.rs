// @generated automatically by Diesel CLI.

diesel::table! {
    a (account) {
        #[max_length = 255]
        account -> Varchar,
        #[max_length = 255]
        psd -> Varchar,
    }
}
