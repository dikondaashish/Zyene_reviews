import { Check, Minus } from "lucide-react";
import { PLAN_MATRIX, type MatrixValue } from "@/lib/marketing/pricing-plan-matrix";
import styles from "@/components/marketing/pricing.module.css";

const PLAN_NAMES = ["Starter", "Professional", "Enterprise"] as const;

function MatrixCell({ value }: { value: MatrixValue }) {
  if (typeof value === "string") return <span className={styles.matrixText}>{value}</span>;
  return value ? (
    <>
      <Check className={styles.matrixYes} size={16} aria-hidden="true" />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus className={styles.matrixNo} size={16} aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </>
  );
}

/** Every plan feature in one grouped table, so the plan cards above can stay short. */
export function PricingClientPlanMatrixSection() {
  return (
    <section id="compare-plans" className="marketing-section" aria-labelledby="compare-plans-heading">
      <div className="marketing-container">
        <div className={styles.sectionHead}>
          <p className="marketing-eyebrow">Compare plans</p>
          <h2 id="compare-plans-heading">Everything in each plan.</h2>
        </div>
        <div role="region" aria-label="Plan feature comparison" tabIndex={0} className={styles.matrixWrap}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Feature</span></th>
                {PLAN_NAMES.map((name) => <th key={name} scope="col">{name}</th>)}
              </tr>
            </thead>
            {PLAN_MATRIX.map((group) => (
              <tbody key={group.title}>
                <tr className={styles.matrixGroup}>
                  <th scope="colgroup" colSpan={4}>{group.title}</th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {row.values.map((value, i) => (
                      <td key={PLAN_NAMES[i]}><MatrixCell value={value} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  );
}
