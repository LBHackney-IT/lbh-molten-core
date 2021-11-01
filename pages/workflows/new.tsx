import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { Resident } from "../../types"
import TextField from "../../components/FlexibleForms/TextField"
import { Form, Formik, Field, ErrorMessage } from "formik"
import formsConfig from "../../config/forms"
import { newWorkflowSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"
import { GetServerSideProps } from "next"
import { getResidentById } from "../../lib/residents"
import { getSession } from "next-auth/client"
import prisma from "../../lib/prisma"
import { Workflow, WorkflowType } from "@prisma/client"
import FormStatusMessage from "../../components/FormStatusMessage"
import { prettyResidentName } from "../../lib/formatters"
import { Form as FormT } from "../../types"
import { csrfFetch } from "../../lib/csrfToken"
import { isInPilotGroup } from "../../lib/googleGroups"
import { protectRoute } from "../../lib/protectRoute"

interface Props {
  resident: Resident
  forms: FormT[]
}

const NewWorkflowPage = ({ resident, forms }: Props): React.ReactElement => {
  const { push, query } = useRouter()

  const unlinkedReassessment = query["unlinked_reassessment"]

  const choices = forms.map(form => ({
    label: form.name,
    value: form.id,
  }))

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
        }),
      })
      const workflow = await res.json()
      if (workflow.id)
        push(`/workflows/${workflow.id}/confirm-personal-details`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Assessment type"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
        { current: true, text: "New workflow" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>
              What kind of{" "}
              {unlinkedReassessment ? "reassessment" : "assessment"} is this?
            </legend>
          </h1>
        </div>

        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              formId: "",
              socialCareId: resident.mosaicId,
              type: unlinkedReassessment
                ? WorkflowType.Reassessment
                : WorkflowType.Assessment,
            }}
            onSubmit={handleSubmit}
            validationSchema={newWorkflowSchema(forms)}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form className="govuk-grid-column-two-thirds">
                <p>
                  If the assessment you need isn&apos;t here, use the old form.
                </p>

                <FormStatusMessage />
                <div
                  className={`govuk-radios lbh-radios govuk-form-group lbh-form-group ${
                    touched.formId && errors.formId && "govuk-form-group--error"
                  }`}
                >
                  <ErrorMessage name="formId">
                    {msg => (
                      <p
                        className="govuk-error-message lbh-error-message"
                        role="alert"
                      >
                        <span className="govuk-visually-hidden">Error:</span>
                        {msg}
                      </p>
                    )}
                  </ErrorMessage>

                  {choices.map(choice => (
                    <div className="govuk-radios__item" key={choice.value}>
                      <Field
                        type="radio"
                        name="formId"
                        value={choice.value}
                        id={choice.value}
                        className="govuk-radios__input"
                      />

                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={choice.value}
                      >
                        {choice.label}
                      </label>
                    </div>
                  ))}
                </div>

                {unlinkedReassessment && (
                  <>
                    <div className="govuk-inset-text lbh-inset-text">
                      <p>
                        You&apos;re about to create a reassessment that
                        isn&apos;t linked to an existing workflow.
                      </p>
                      <p className="govuk-!-margin-top-3">
                        Only continue if you&apos;re sure the previous workflow
                        exists but hasn&apos;t been imported.
                      </p>
                    </div>

                    <TextField
                      name="linkToOriginal"
                      label="Where is the previous workflow?"
                      hint="Provide a link to the Google doc or similar"
                      touched={touched}
                      errors={errors}
                      className="govuk-input--width-20"
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  Continue
                </button>
              </Form>
            )}
          </Formik>

          <div className="govuk-grid-column-one-third">
            <ResidentWidget socialCareId={resident.mosaicId} />
          </div>
        </div>
      </fieldset>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async req => {
    const { social_care_id, form_id } = req.query
    const {
      req: { headers },
    } = req

    const isUserInPilotGroup = await isInPilotGroup(headers.cookie)

    if (!isUserInPilotGroup)
      return {
        props: {},
        redirect: {
          destination: headers.referer ?? "/",
        },
      }

    // skip this page entirely if the right information is in the url
    if (social_care_id && form_id) {
      const session = await getSession(req)
      const newWorkflow: Workflow = await prisma.workflow.create({
        data: {
          socialCareId: social_care_id as string,
          formId: form_id as string,
          createdBy: session.user.email,
          updatedBy: session.user.email,
          assignedTo: session.user.email,
        },
      })
      return {
        props: {},
        redirect: {
          destination: `/workflows/${newWorkflow.id}/confirm-personal-details`,
        },
      }
    }

    const resident = await getResidentById(social_care_id as string)

    // redirect if resident doesn't exist
    if (!resident)
      return {
        props: {},
        redirect: {
          destination: "/404",
        },
      }

    return {
      props: {
        resident,
        forms: await formsConfig(),
      },
    }
  }
)

export default NewWorkflowPage
