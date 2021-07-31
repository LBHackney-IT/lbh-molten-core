import { Workflow } from "@prisma/client"
import { GetServerSideProps } from "next"
import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { mockWorkflow } from "../fixtures/workflows"

interface Props {
  workflows: Workflow[]
}

const IndexPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout
      title="Dashboard"
      breadcrumbs={[
        {
          href: "/jjj",
          text: "Blah",
        },
        {
          href: "/jjll",
          text: "Foo",
          current: true,
        },
      ]}
    >
      <h1 className="govuk-visually-hidden">Dashboard</h1>

      <h2>Work in progress</h2>

      <WorkflowList workflows={workflows} />
      <h2>Reviewable</h2>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  // const workflows = await prisma.workflow.findMany({
  //   where: {
  //     discardedAt: null,
  //   },
  //   include: {
  //     resident: true,
  //   },
  // })

  const workflows = [JSON.stringify(mockWorkflow), JSON.stringify(mockWorkflow)]

  return {
    props: { workflows },
  }
}

export default IndexPage
