import Header from "../components/Header"
import PhaseBanner from "../components/PhaseBanner"
import Head from "next/head"
import Breadcrumbs, { Crumb } from "./Breadcrumbs"

interface Props {
  /** set a new document title */
  title?: string
  /** layout should be full-width */
  fullWidth?: boolean
  /** content for the breadcrumbs area */
  breadcrumbs?: Crumb[]
  children: React.ReactChild | React.ReactChild[]
}

const Layout = ({
  title,
  fullWidth,
  children,
  breadcrumbs,
}: Props): React.ReactElement => (
  <>
    {title && (
      <Head>
        <title>{title} | Social care | Hackney Council</title>
      </Head>
    )}

    <a href="#main-content" className="govuk-skip-link lbh-skip-link">
      Skip to main content
    </a>

    <Header fullWidth={fullWidth} />
    <PhaseBanner fullWidth={fullWidth} />

    {breadcrumbs && <Breadcrumbs crumbs={breadcrumbs} fullWidth={fullWidth} />}

    <main className="lbh-main-wrapper" id="main-content" role="main">
      <div
        className={fullWidth ? "lbh-container lmf-full-width" : "lbh-container"}
      >
        {children}
      </div>
    </main>
  </>
)

export default Layout
