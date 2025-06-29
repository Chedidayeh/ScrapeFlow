import { Environment, ExecutionEnvironment } from "@/types/executor";
import { LaunchBrowserTask } from "../task/LaunchBrowser";
import { TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { PageToHtmlTask } from "../task/PageToHtml";
import puppeteer from "puppeteer";
import { ExtractTextFromElementTask } from "../task/ExtractTextFromElement";
import * as cheerio from "cheerio";
import { FillInputTask } from "../task/FillInput";
import { waitFor } from "@/lib/helper/waitFor";
import { ClickElementTask } from "../task/ClickElement";
import { WaitForElementTask } from "../task/WaitForElement";
import { DeliverViaWebhookTask } from "../task/DeliverViaWebhook";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import prisma from "@/lib/db/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJson";
import { AddPropertyToJsonTask } from "../task/AddPropertyToJson";
import { NavigateUrlTask } from "../task/NavigateUrl";

type ExecutorFn<T extends WorkflowTask> = (environment: ExecutionEnvironment<T>) => Promise<boolean>;

type RegistryType = {
    [K in TaskType]: ExecutorFn<WorkflowTask & { type: K }>;
};



export const ExecutorRegistry: RegistryType = {
    LAUNCH_BROWSER: LaunchBrowserExecutor,
    PAGE_TO_HTML: PageToHtmlExecutor,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
    FILL_INPUT: FillInputExecutor,
    CLICK_ELEMENT: ClickElementExecutor,
    WAIT_FOR_ELEMENT: WaitForElementExecutor,
    DELIVER_VIA_WEBHOOK: DeliverViaWebhookExecutor,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAIExecutor,
    READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor,
    ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor,
    NAVIGATE_URL: NavigateUrlExecutor,
};


export async function LaunchBrowserExecutor(
    environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {

    try {
        const webisteUrl = environment.getInput("Website Url")

        const browser = await puppeteer.launch({
            headless: true,
        })
        environment.log.info("Browser started successfully")

        environment.setBrowser(browser)
        const page = await browser.newPage()
        await page.goto(webisteUrl)

        environment.setPage(page)

        environment.log.info(`Opened page at:${webisteUrl} `)



        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false;

    }


}

export async function PageToHtmlExecutor(
    environment: ExecutionEnvironment<typeof PageToHtmlTask>
): Promise<boolean> {
    try {
        const html = await environment.getPage()!.content()
        environment.setOutput("Html", html);
        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function ExtractTextFromElementExecutor(
    environment: ExecutionEnvironment<typeof ExtractTextFromElementTask>
): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector");
        if (!selector) {
            console.error("Selector not defined");
            environment.log.error("Selector is not provided")

            return false
        }
        const html = environment.getInput("Html")
        if (!html) {
            console.error("Html not defined");
            environment.log.error("Html is not provided")
            return false
        }

        const $ = cheerio.load(html);

        const element = $(selector);

        if (!element) {
            console.error("Element not found");
            environment.log.error("Element is not found")
            return false;
        }

        const extractedText = $.text(element);
        if (!extractedText) {
            console.error("Element has no text");
            environment.log.error("Element has no text")
            return false
        }

        environment.setOutput("Extracted text", extractedText)

        return true;
    } catch (error: any) {
        environment.log.error(error.message)
        return false;

    }


}

export async function FillInputExecutor(
    environment: ExecutionEnvironment<typeof FillInputTask>
): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector")
        if (!selector) {
            environment.log.error("input=>selector is not defined")
            return false
        }

        const value = environment.getInput("Value")
        if (!selector) {
            environment.log.error("input=>value is not defined")
            return false
        }

        await environment.getPage()!.type(selector, value)

        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function ClickElementExecutor(
    environment: ExecutionEnvironment<typeof ClickElementTask>
): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector")
        if (!selector) {
            environment.log.error("input=>selector is not defined")
            return false
        }


        await Promise.all([
            environment.getPage()!.waitForNavigation({ waitUntil: "networkidle0" }),
            environment.getPage()!.click(selector),
        ]);


        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function WaitForElementExecutor(
    environment: ExecutionEnvironment<typeof WaitForElementTask>
): Promise<boolean> {
    try {
        const selector = environment.getInput("Selector")
        if (!selector) {
            environment.log.error("input=>selector is not defined")
            return false
        }

        const visibility = environment.getInput("Visibility")
        if (!visibility) {
            environment.log.error("input=>visibility is not defined")
            return false
        }




        await environment.getPage()!.waitForSelector(selector, {
            visible: visibility === "visible",
            hidden: visibility === "hidden",
        });

        environment.log.info(`Element ${selector} became: ${visibility}`)


        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function DeliverViaWebhookExecutor(
    environment: ExecutionEnvironment<typeof DeliverViaWebhookTask>
): Promise<boolean> {
    try {
        const targetUrl = environment.getInput("Target Url")
        if (!targetUrl) {
            environment.log.error("input=>targetUrl is not defined")
            return false
        }

        const body = environment.getInput("Body")
        if (!targetUrl) {
            environment.log.error("input=>body is not defined")
            return false
        }

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const statusCode = response.status;
        if (statusCode !== 200) {
            environment.log.error(`status Code: ${statusCode} `)
            return false;
        }

        const responseBody = await response.json();
        environment.log.info(JSON.stringify(responseBody, null, 4));

        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false
    }


}


export async function ExtractDataWithAIExecutor(
    environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
    try {
        const credentials = environment.getInput("Credentials")
        if (!credentials) {
            environment.log.error("input=>credentials is not defined")
            return false
        }

        const prompt = environment.getInput("Prompt")
        if (!prompt) {
            environment.log.error("input=>prompt is not defined")
            return false
        }

        const content = environment.getInput("Content")
        if (!content) {
            environment.log.error("input=>content is not defined")
            return false
        }

        // get credentials from database 
        const credential = await prisma.credential.findUnique({
            where: { id: credentials },
        });

        if (!credential) {
            environment.log.error("credential not found");
            return false;
        }

        const plainCredentialValue = symmetricDecrypt(credential.value);

        if (!plainCredentialValue) {
            environment.log.error("cannot decrypt credential");
            return false;
        }

        // const mockExtractedData = {
        //     usernameSelector:"#username",
        //     passwordSelector:"#password",
        //     loginSelector:"body > div.container > form > input.btn.btn-primary",
        // };

        const AI_Behavoir = `You are a webscraper helper that extracts data from HTML or text. 
        You will be given a piece of text or HTML content as input and also the user prompt with the data you have to extract. 
        The response should always be only the extracted data as a JSON array or object, 
        without any additional words or explanations. Analyze the input carefully 
        and extract data precisely based on the prompt. If no data is found, 
        return an empty JSON array. Work only with the provided content 
        and ensure the output is always a valid JSON array without any surrounding text.
        \n\nUserPrompt: ${prompt}\n\nContent: ${content}`;

        const genAI = new GoogleGenerativeAI(plainCredentialValue);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(AI_Behavoir);
        environment.log.info(`Extracted result ${JSON.stringify(result)}`);

        const response = result.response;
        environment.log.info(`Extracted response ${JSON.stringify(response)}`);

        const text = response.text();
        environment.log.info(`Extracted text ${text}`);

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        environment.log.info(`Extracted cleanedText ${cleanedText}`);

        const data = JSON.parse(cleanedText);
        environment.log.info(`Extracted JSON Data ${JSON.stringify(data)}`);

        environment.setOutput("Extracted data", JSON.stringify(data));


        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function ReadPropertyFromJsonExecutor(
    environment: ExecutionEnvironment<typeof ReadPropertyFromJsonTask>
): Promise<boolean> {
    try {

        const jsonData = environment.getInput("JSON");
        if (!jsonData) {
            environment.log.error("input->JSON not defined");
            return false
        }

        const propertyName = environment.getInput("Property Name");
        if (!propertyName) {
            environment.log.error("input->property Name not defined");
            return false
        }

        const json = JSON.parse(jsonData);
        const propertyValue = json[propertyName]

        if (propertyValue === undefined) {
            environment.log.error("property not found");
            return false;
        }

        environment.setOutput("Property Value", propertyValue);

        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}


export async function AddPropertyToJsonExecutor(
    environment: ExecutionEnvironment<typeof AddPropertyToJsonTask>
): Promise<boolean> {
    try {

        const jsonData = environment.getInput("JSON");
        if (!jsonData) {
            environment.log.error("input->JSON not defined");
            return false
        }

        const propertyName = environment.getInput("Property Name");
        if (!propertyName) {
            environment.log.error("input->property Name not defined");
            return false
        }

        const propertyValue = environment.getInput("Property Value");
        if (!propertyValue) {
            environment.log.error("input->property Value not defined");
            return false
        }

        const json = JSON.parse(jsonData);
        json[propertyName] = propertyValue;



        environment.setOutput("Updated Json", JSON.stringify(json));

        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}

export async function NavigateUrlExecutor(
    environment: ExecutionEnvironment<typeof NavigateUrlTask>
): Promise<boolean> {
    try {

        const url = environment.getInput("URL")
        if (!url) {
            environment.log.error("input=>url is not defined")
            return false
        }

        await environment.getPage()!.goto(url);
        environment.log.info(`visited ${url}`)

        return true;

    } catch (error: any) {
        environment.log.error(error.message)
        return false

    }


}