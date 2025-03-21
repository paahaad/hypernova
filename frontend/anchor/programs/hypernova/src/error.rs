use anchor_lang::prelude::*;

#[error_code]
pub enum LaunchpadError {
    #[msg("Invalid presale percentage")]
    InvalidPresalePercentage,
    #[msg("Invalid total supply")]
    InvalidTotalSupply,
    #[msg("Insufficient tokens in presale pool")]
    InsufficientTokens,
    #[msg("Invalid presale time: start time must be before end time")]
    InvalidPresaleTime,
    #[msg("Invalid purchase limits: min must be less than max and max must be greater than zero")]
    InvalidPurchaseLimits,
    #[msg("Presale has not started yet")]
    PresaleNotStarted,
    #[msg("Presale has already ended")]
    PresaleEnded,
    #[msg("Purchase amount is below minimum allowed")]
    BelowMinimumPurchase,
    #[msg("Purchase amount is above maximum allowed")]
    AboveMaximumPurchase,
}