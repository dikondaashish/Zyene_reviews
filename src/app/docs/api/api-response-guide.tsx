import { DocCodeBlock } from "@/components/docs/doc-code-block";

export function ApiResponseGuide() {
    return <section>
        <h2 id="responses">Responses and retries</h2>
        <p>Successful calls return <code>success: true</code> with a <code>data</code> object. Errors return <code>success: false</code> and an <code>error</code> message.</p>
        <DocCodeBlock language="json" code={'{"success":true,"data":{"page":1,"limit":20,"total":0,"reviews":[]}}'} />
        <ul>
            <li><strong>400:</strong> Correct the payload or contact details before retrying.</li>
            <li><strong>401:</strong> Check whether your key is missing, revoked or expired.</li>
            <li><strong>403:</strong> Check endpoint scope, business access and sending allowances.</li>
            <li><strong>429:</strong> Your key’s request limit was reached. Wait before retrying and use increasing delays.</li>
            <li><strong>500/503:</strong> Retry read requests with a bounded delay; contact support if failures persist.</li>
        </ul>
        <h2 id="pagination">Pagination and metrics</h2>
        <p>Reviews use page-based pagination: <code>page</code> starts at 1 and <code>limit</code> defaults to 20, with a maximum of 100. Stop when the returned reviews are empty or <code>page × limit</code> reaches <code>total</code>. Status values are <code>pending</code>, <code>responded</code> and <code>ignored</code>; <code>minRating</code> accepts 1–5.</p>
        <p>Analytics accepts <code>days</code> from 1–365. Request completion includes feedback submissions and Google handoffs. Neither <code>completed</code> nor the legacy <code>reviewLeft</code> field proves a review was published. Synced reviews are reported separately.</p>
        <h2 id="sending">Sending requests</h2>
        <p>Send <code>channel</code> as <code>sms</code> (default), <code>email</code>, <code>both</code> or <code>link</code>. SMS requires a phone number with country code; email requires a valid address; both requires both details. Link creates a shareable request without sending a message.</p>
        <p>The result contains <code>requestId</code>, <code>status</code>, <code>channel</code> and <code>reviewLink</code>. Check <code>warning</code>: for both channels, one delivery can fail while the other succeeds. A sent status is not a delivery receipt or proof of publication.</p>
        <p>The send endpoint does not accept an idempotency key. After a timeout, check Requests in the dashboard before resending. Frequency caps help prevent repeated requests but are not a substitute for retry tracking in your integration.</p>
    </section>;
}
