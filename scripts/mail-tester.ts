import { sendEmail } from '../src/services/resend/send-email';
import { welcomeEmail } from '../src/services/resend/templates/welcome-email';
import { TeamInviteEmail } from '../src/services/resend/templates/team-invite-email';
import { reviewAlertEmail } from '../src/services/resend/templates/review-alert-email';
import { reviewRequestEmail } from '../src/services/resend/templates/review-request-email';
import { dailyDigestEmail } from '../src/services/resend/templates/daily-digest-email';

async function runTest() {
    const targetEmail = process.argv[2];

    if (!targetEmail) {
        console.error('❌ Error: Please provide a target email address.');
        console.log('Usage: npx tsx scripts/mail-tester.ts <email>');
        process.exit(1);
    }

    console.log(`🚀 Starting Mail Test for: ${targetEmail}`);
    console.log('---');

    const appUrl = 'https://zyenereviews.com';

    const tests = [
        {
            name: 'Welcome Email',
            subject: 'Welcome to Zyene Reviews!',
            html: welcomeEmail({
                userName: 'Test User',
                loginUrl: `${appUrl}/login`
            })
        },
        {
            name: 'Team Invite',
            subject: 'Join Zyene Team',
            html: TeamInviteEmail(
                `${appUrl}/signup?invite=test-token`,
                'Ashish (Admin)',
                'Zyene Reviews'
            )
        },
        {
            name: 'New Review Alert (High Priority)',
            subject: '⚠️ New 1★ review for Zyene Reviews',
            html: reviewAlertEmail({
                businessName: 'Zyene Reviews',
                rating: 1,
                authorName: 'Frustrated Customer',
                reviewText: 'The service was extremely slow and the food was cold. Never coming back.',
                urgencyScore: 9,
                dashboardUrl: `${appUrl}/dashboard`,
                settingsUrl: `${appUrl}/settings/notifications`
            })
        },
        {
            name: 'Review Request (Outbound)',
            subject: 'How was your visit to Zyene Reviews?',
            html: reviewRequestEmail({
                customerName: 'Loyal Customer',
                businessName: 'Zyene Reviews',
                reviewLink: `${appUrl}/review/zyene-hq`
            })
        },
        {
            name: 'Daily Digest',
            subject: 'Daily Review Summary for Zyene Reviews',
            html: dailyDigestEmail({
                businessName: 'Zyene Reviews',
                totalNew: 12,
                avgRating: 4.2,
                pendingCount: 5,
                dashboardUrl: `${appUrl}/dashboard`,
                settingsUrl: `${appUrl}/settings/notifications`,
                reviews: [
                    { rating: 5, authorName: 'John Doe', text: 'Amazing service! Highly recommend.', sentiment: 'positive' },
                    { rating: 4, authorName: 'Jane Smith', text: 'Good experience, but a bit pricey.', sentiment: 'neutral' },
                    { rating: 2, authorName: 'Bob Brown', text: 'Disappointed with the wait time.', sentiment: 'negative' }
                ]
            })
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📡 Sending [${test.name}]...`);
            const result = await sendEmail({
                to: targetEmail,
                subject: test.subject,
                html: test.html
            });
            console.log(`✅ [${test.name}] Sent! ID: ${result.id}`);
        } catch (err: any) {
            console.error(`❌ [${test.name}] Failed:`, err.message);
        }
    }

    console.log('---');
    console.log('✨ Mail test sequence completed.');
}

runTest().catch(console.error);
