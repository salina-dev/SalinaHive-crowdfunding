use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Title too long")] 
    TitleTooLong,
    #[msg("Description too long")] 
    DescriptionTooLong,
    #[msg("URL too long")] 
    UrlTooLong,
    #[msg("Deadline must be in the future")] 
    DeadlineInPast,
    #[msg("Only creator can update or delete the campaign")] 
    Unauthorized,
    #[msg("Campaign already deleted")] 
    CampaignDeleted,
    #[msg("Goal not reached or deadline not passed")] 
    WithdrawNotAllowed,
    #[msg("Amount must be greater than zero")] 
    InvalidAmount,
} 