import { LaunchBrowserTask } from "@/lib/workflow/task/LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { FillInputTask } from "./FillInput";
import { ClickElementTask } from "./ClickElement";
import { WaitForElementTask } from "./WaitForElement";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJson";
import { ExtractDataWithAITask } from "./ExtractDataWithAI";
import { AddPropertyToJsonTask } from "./AddPropertyToJson";
import { NavigateUrlTask } from "./NavigateUrl";

type Registry = {
    [K in TaskType]: WorkflowTask & {type : K}
};

export const TaskRegistry : Registry = {
    LAUNCH_BROWSER: LaunchBrowserTask,
    PAGE_TO_HTML : PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT : ExtractTextFromElementTask,
    FILL_INPUT : FillInputTask,
    CLICK_ELEMENT : ClickElementTask,
    WAIT_FOR_ELEMENT : WaitForElementTask,
    DELIVER_VIA_WEBHOOK : DeliverViaWebhookTask,
    EXTRACT_DATA_WITH_AI : ExtractDataWithAITask,
    READ_PROPERTY_FROM_JSON : ReadPropertyFromJsonTask,
    ADD_PROPERTY_TO_JSON : AddPropertyToJsonTask,
    NAVIGATE_URL : NavigateUrlTask,

};