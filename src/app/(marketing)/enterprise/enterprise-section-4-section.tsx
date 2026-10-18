import { ENTERPRISE_COMPARISON_ROWS } from "@/lib/enterprise/enterprise-data";

export function EnterpriseSection4Section() {
    return (
        <section className="marketing-section" aria-labelledby="enterprise-plans-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Plan comparison</p>
                    <h2 id="enterprise-plans-heading">How Enterprise differs from self-serve plans.</h2>
                </div>
                <div className="mi-table-wrap">
                    <table className="mi-table">
                        <caption className="sr-only">Starter, Professional and Enterprise plan comparison</caption>
                        <thead>
                            <tr>
                                <th scope="col">Feature</th>
                                <th scope="col">Starter</th>
                                <th scope="col">Professional</th>
                                <th scope="col">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ENTERPRISE_COMPARISON_ROWS.map((row) => (
                                <tr key={row.feature}>
                                    <th scope="row">{row.feature}</th>
                                    <td>{row.starter}</td>
                                    <td>{row.professional}</td>
                                    <td className="text-foreground font-medium">{row.enterprise}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
