/** PostgREST outbound + delivery filter strings for review_requests stats. */
export function buildRequestsPageFilters() {
    const outboundRequestFilter =
        "customer_phone.not.is.null,customer_email.not.is.null,customer_name.not.is.null,campaign_id.not.is.null";
    const legacySentStatuses = "sent,delivered,clicked,completed,feedback_left";
    const successfullySent = [
        "email_status.eq.sent",
        "sms_status.eq.sent",
        `and(channel.eq.link,status.eq.sent)`,
        `and(email_status.is.null,sms_status.is.null,status.in.(${legacySentStatuses}))`,
    ].join(",");
    const outboundAndSent = `and(or(${outboundRequestFilter}),or(${successfullySent}))`;
    const clickedOrConverted =
        "clicked_at.not.is.null,status.eq.clicked,review_left.eq.true,completed_at.not.is.null,status.eq.completed,status.eq.feedback_left";
    const outboundAndClicked = `and(or(${outboundRequestFilter}),or(${clickedOrConverted}))`;
    const outboundAndDelivered = `and(or(${outboundRequestFilter}),delivered_at.not.is.null)`;
    const completedOrReviewLeft =
        "review_left.eq.true,completed_at.not.is.null,status.eq.completed,status.eq.feedback_left";
    const outboundAndConverted = `and(or(${outboundRequestFilter}),or(${completedOrReviewLeft}))`;
    const outboundAndEmailSent = `and(or(${outboundRequestFilter}),email_status.eq.sent)`;
    const outboundAndSmsSent = `and(or(${outboundRequestFilter}),sms_status.eq.sent)`;
    const outboundAndEmailFailed = `and(or(${outboundRequestFilter}),email_status.eq.failed)`;
    const outboundAndSmsFailed = `and(or(${outboundRequestFilter}),sms_status.eq.failed)`;

    return {
        outboundRequestFilter,
        outboundAndSent,
        outboundAndClicked,
        outboundAndDelivered,
        outboundAndConverted,
        outboundAndEmailSent,
        outboundAndSmsSent,
        outboundAndEmailFailed,
        outboundAndSmsFailed,
    };
}
