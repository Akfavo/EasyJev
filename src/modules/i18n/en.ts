import type { Dictionary } from './fr';
import { validationMessagesEn } from './validation-messages';

export const en: Dictionary = {
  meta: {
    title: 'EasyJev — Describe. Adjust. Copy.',
    description:
      'Set up Jev without writing JSON: describe what it should decide, tweak it, then copy the request for your n8n workflow.',
  },
  skipLink: 'Skip to content',
  header: {
    brand: 'EasyJev',
    langAriaLabel: 'Interface language',
    howItWorksButton: 'How it works',
    howItWorksShort: 'Demo',
    howItWorksAriaLabel: 'How it works: watch the animated demo',
    aboutButton: 'About',
    aboutShort: 'Info',
    aboutAriaLabel: 'About EasyJev: what Jev is, trust and security',
    aiSettings: {
      buttonLabel: 'Key & model',
      buttonShort: 'Key',
      keyReady: 'Key ready',
      keyMissing: 'Key missing',
      done: 'Done',
      keyPrompt: 'Add your Claude key to generate questions',
      modelLine: (modelLabel: string) => `Model: ${modelLabel} \u00b7 Change`,
    },
    languages: {
      fr: 'Fran\u00e7ais',
      en: 'English',
    },
  },
  footer: {
    productName: 'EasyJev',
    disclaimer: 'Independent tool, not affiliated with TypeSafe AI.',
  },
  windows: {
    collapse: 'Collapse',
    expand: 'Open',
    close: 'Close',
    collapseAria: 'Collapse window',
    expandAria: 'Expand window',
    closeAria: 'Close window',
    about: {
      title: 'about.app',
      badge: 'v1.0 · SYSTEM ONE',
    },
    describe: {
      title: 'describe.app',
      badge: 'NATURAL LANGUAGE & TEMPLATES',
    },
    adjust: {
      title: 'adjust.app',
      badge: (count: number) =>
        `2-PANE EDITOR · ${count} ${count === 1 ? 'QUESTION' : 'QUESTIONS'}`,
    },
    copy: {
      title: 'copy.app',
      badgeReady: 'JSON READY',
      badgeBlocked: 'ATTENTION REQUIRED',
    },
    settings: {
      title: 'settings.app',
      badge: 'ANTHROPIC CLAUDE',
    },
    n8nHelp: {
      title: 'n8n-help.app',
      badge: 'INTEGRATION GUIDE',
    },
  },
  home: {
    title: 'Describe. Adjust. Copy.',
    subtitle:
      'Set up Jev without writing JSON: describe what it should decide, tweak it, then copy the request for your n8n workflow.',
    pitch: {
      heroLine:
        'Jev makes the call in a split second. EasyJev helps you talk to it in your own words.',
      jev: {
        title: 'What is Jev?',
        text: 'Jev is an AI model built by TypeSafe AI, a San Francisco lab. It’s not a chatbot: it reads text like an LLM (ChatGPT, Claude…), but instead of writing an answer, it makes a decision. You give it a text and some questions, and it answers with a choice, a score or a yes/no, along with a confidence level. According to TypeSafe, it’s very fast and very cheap: perfect for sorting, routing or scoring messages inside an automation, where an LLM would be too slow, too expensive or too chatty.',
      },
      easy: {
        title: 'And what is EasyJev for?',
        text: 'Jev only understands one precise format: JSON containing your text and your questions. EasyJev builds it for you. Describe in your own words what Jev should decide, and an AI (Claude, by Anthropic, using your own API key) writes the questions for you. Tweak them if needed, then copy the request, ready to paste into your n8n workflow or any tool that can send a web request. Not into AI? Start from a template or build your questions by hand: it works without a key.',
      },
    },
    templates: {
      sectionTitle: 'No Claude key? Start from a template:',
      sectionSubtitle:
        'Start in one click with a battle-tested setup, or craft your own custom query.',
      custom: {
        title: 'Start from scratch',
        description:
          'Start with a blank canvas, one default field, and craft your own questions.',
        meta: 'Write questions yourself',
      },
      items: {
        triage: {
          title: 'Triage customer requests',
          description:
            'Classify the intent of incoming requests and score their operational urgency.',
        },
        urgence: {
          title: 'Detect urgency',
          description:
            'Spot critical alerts and quantify operational priority on a dedicated scale.',
        },
        lead: {
          title: 'Qualify a lead',
          description:
            'Assess commercial intent, project maturity, and decision authority.',
        },
        avis: {
          title: 'Analyze a customer review',
          description:
            'Measure sentiment, pinpoint the main topic, and flag reviews requiring a follow-up.',
        },
      },
      templateMeta: (questionsCount: number, fieldsCount: number) =>
        `${questionsCount} question${questionsCount === 1 ? '' : 's'} · ${fieldsCount} field${fieldsCount === 1 ? '' : 's'}`,
      confirmDialog: {
        title: 'Replace current content?',
        message:
          'Your editor already contains work (modified questions or fields). Continuing will replace current fields and questions.',
        confirm: 'Replace',
        cancel: 'Keep my work',
      },
      templateLoaded: (title: string) => `Template loaded: ${title}`,
    },
    steps: {
      describe: 'Describe',
      adjust: 'Adjust',
      copy: 'Copy',
      adjustSubtitle: 'Check what Jev reads and tweak the questions.',
    },
    startingPoint: {
      sectionTitle: 'Starting point',
      sectionSubtitle: 'Describe what Jev should decide: Claude writes the questions for you.',
      collapse: 'Collapse',
      expand: 'Expand',
    },
  },
  trust: {
    sectionAriaLabel: 'Security and transparency',
    data: {
      title: 'Where does your data go?',
      item1:
        'Without generation, what you enter is never sent to any server: everything stays in your browser.',
      item2:
        'With generation, your description, field names, and key are sent directly to api.anthropic.com, without any EasyJev server or storage.',
      item3:
        'Data processing on Anthropic’s side depends on your terms of service with them.',
    },
    key: {
      title: 'Where does my key go?',
      item1:
        'The key is only sent to api.anthropic.com, inside a header of each request, over an HTTPS connection.',
      item2:
        'It stays solely in memory (lost when the tab closes) unless you check remember key on this device.',
      item3:
        'Like any request made from your browser, it is visible in your own browser developer tools.',
    },
    boundaries: {
      title: 'What EasyJev does not do',
      item1:
        'Does not build a full n8n workflow: only an HTTP Request node to paste (or the JSON body), never containing your Jev key.',
      item2: 'Does not call the Jev API on your behalf.',
      item3: 'Does not store your questions, fields, or description.',
      item4: 'What remains your responsibility: keeping your secret key inside your n8n credentials.',
    },
    recommendations: {
      title: 'What we recommend',
      item1: 'Create a dedicated API key for EasyJev in the Anthropic console.',
      item2: 'Set a monthly spending limit in the console to stay in control of costs.',
      item3: 'Revoke it immediately if you believe it might have been exposed.',
      item4: 'Do not check key remembering on a shared computer.',
    },
  },
  donate: {
    title: 'Support EasyJev',
    description:
      'EasyJev is free, with no ads or sponsors. If you find it helpful, you can support its hosting and ongoing maintenance.',
    button: 'Make a donation',
    ariaLabel: 'Make a donation to support EasyJev (opens in a new window)',
  },
  generation: {
    ui: {
      cardSubtitle:
        'Describe your use case, Claude suggests questions ready for Jev.',
      descriptionLabel: 'Describe what Jev needs to decide',
      descriptionPlaceholder:
        'e.g., Jev must triage customer reviews for a restaurant: evaluate sentiment (positive/negative), identify the dish mentioned, and flag if the customer requests a refund.',
      charCount: (current: number, min: number, max: number) =>
        `${current} / ${max} characters (min. ${min})`,
      fieldsReadPrefix: 'Jev will read:',
      fieldsLink: 'Edit fields',
      dataLabel: 'Your data',
      dataOptional: 'optional',
      dataPlaceholder: 'Paste the JSON from your n8n node’s OUTPUT panel here…',
      dataHint:
        'In n8n, open the node right before Jev, switch its OUTPUT panel to JSON view, copy everything and paste here. What you paste stays in your browser: only the field names are sent to Claude, never the values.',
      dataDetected: (count: number) =>
        count > 1 ? `${count} fields detected` : `${count} field detected`,
      dataFieldsAria: 'Fields detected in your data',
      dataPickHint:
        'Nothing ticked: Claude picks the useful fields. Tick fields to force the ones Jev reads.',
      dataSkipped: (count: number) =>
        count > 1
          ? `${count} fields skipped (nested content or incompatible name)`
          : `${count} field skipped (nested content or incompatible name)`,
      dataTruncated: (max: number) => `Only the first ${max} fields are offered.`,
      dataUseSelected: (count: number) => `Use the ticked fields (${count})`,
      dataClear: 'Clear the data',
      apiKeyLabel: 'Claude API key',
      apiKeyPlaceholder: 'sk-ant-...',
      showApiKey: 'Show key',
      hideApiKey: 'Hide key',
      apiKeySoftWarning: 'The key should start with sk-ant-',
      createApiKeyLink: 'Create a key in the Anthropic console',
      apiKeyWhereSummary: 'Where does my key go?',
      apiKeyWhereDetails:
        'The key is only sent to api.anthropic.com, inside a header of each request, over an HTTPS connection. It stays in memory by default. Like any request made from your browser, it is visible in your developer tools.',
      rememberKeyLabel: 'Remember on this device',
      rememberKeyWarning:
        'The key is stored in plain text in this device’s browser (localStorage). Any script running on this site could read it. Do not use on a shared computer.',
      forgetKeyButton: 'Forget key',
      modelSelectLabel: 'Claude model',
      modelDescriptions: {
        'claude-haiku-5-5':
          'Fast and cost-effective, ideal for structured question generation',
        'claude-sonnet-5-5':
          'Deep reasoning for complex or nuanced use cases',
      },
      pricingIndicative: (input: number, output: number) =>
        `$${input} / $${output} per million tokens`,
      generateButton: 'Generate questions',
      generatingButton: 'Generating…',
      cancelButton: 'Cancel',
      loadingState: 'Claude is analyzing your description and formulating Jev questions…',
      cancelledAnnouncement: 'Generation cancelled.',
      questionsGeneratedAnnouncement: (count: number) =>
        `${count} question${count === 1 ? '' : 's'} generated`,
      costEstimate: (costFormatted: string, inputTokens: number, outputTokens: number) =>
        `Estimated cost: ~${costFormatted} (${inputTokens} input tokens, ${outputTokens} output)`,
      generatedNotice: (count: number, modelLabel: string) =>
        `${count} question${count === 1 ? '' : 's'} generated with ${modelLabel}`,
      retryButton: 'Retry',
      openConsoleLink: 'Open Anthropic console',
      technicalDetailsSummary: 'Technical details',
      technicalDetails: (status?: number, apiErrorType?: string) =>
        `HTTP ${status ?? '?'} · ${apiErrorType ?? 'unknown'}`,
    },
    errors: {
      invalid_input:
        'Description must be between 10 and 4,000 characters and API key must be provided.',
      invalid_key:
        'Invalid or expired Claude API key. Check your key in the Anthropic console.',
      forbidden:
        'Access denied by the Anthropic API for this key.',
      billing:
        'Insufficient credits on your Anthropic account. Add credits in the console to continue.',
      bad_request:
        'The Claude API rejected the request. Try with the other model or shorten your description. If the problem persists, expand the technical details below.',
      rate_limited:
        'Rate limit reached. Please wait a few seconds before retrying.',
      overloaded:
        'Anthropic servers are temporarily overloaded. Please try again in a moment.',
      network:
        'Unable to reach the Claude API. Check your Internet connection.',
      aborted:
        'Generation was cancelled.',
      bad_output:
        'Claude could not produce valid questions for Jev. Try adjusting your description or build them manually.',
      model_unavailable:
        'This model is not accessible with your key or its identifier has changed. Try selecting the other model.',
      timeout:
        'The 60-second timeout was reached. Claude did not respond in time, please retry.',
      refused:
        'Claude could not process this description. Please rephrase your request.',
    },
  },
  editor: {
    reads: {
      title: 'What Jev reads',
      multipleFieldsHelp: 'In each question, cite the field between backticks (“Insert” button above the instruction).',
      singleFieldHelp:
        'This is the field from the previous node that Jev analyzes. Click its name to rename it.',
      addField: 'Add a field',
      removeFieldAriaLabel: (name: string) => `Remove field ${name}`,
      fieldNameLabel: (name: string) => `Field name ${name}`,
      importFromN8n: 'Import from n8n',
      otherDetectedTitle: 'Also in your data:',
      addDetectedAria: (name: string) => `Add the field ${name} to what Jev reads`,
    },
    n8nImport: {
      errorTooLarge: 'Pasted text exceeds the 1 MB limit.',
      errorInvalidJson: 'The JSON is invalid. Make sure you copied everything.',
      errorNotObject: 'The pasted data does not contain an object.',
      errorEmpty: 'No data or fields found.',
      errorTableView:
        'This is not JSON. You may have copied the Table view: switch to JSON view in n8n.',
      remapTitle: 'Replace the fields cited in your questions',
      remapIntro:
        'Your questions mention fields that no longer exist in your data. Choose what to replace them with, or leave them as they are to fix them yourself.',
      remapCitedIn: (count: number) =>
        count > 1 ? `cited in ${count} questions` : 'cited in 1 question',
      remapLabel: 'Replace it with',
      remapKeep: 'Do not replace (I will fix it myself)',
      remapNote: 'Only names written between backticks are replaced.',
      remapApply: 'Apply',
      remapCancel: 'Go back',
    },
    questions: {
      sectionTitle: 'Questions for Jev',
      listAriaLabel: 'List of questions for Jev',
      selectedAnnouncement: (index: number, total: number) =>
        `Question ${index} of ${total} selected`,
      detailHeading: (index: number, total: number, typeLabel: string) =>
        `Question ${index} of ${total} · ${typeLabel}`,
      emptyState: {
        title: 'Add your first question',
        subtitle: 'Pick the format that best fits your decision:',
        choice: {
          title: 'Category',
          description: 'Choose among multiple mutually exclusive options.',
          example: 'E.g.: Request type (quote, support, partnership)',
          action: 'Create a category',
        },
        score: {
          title: 'Score',
          description: 'Evaluate a level on an ordered scale from 2 to 10.',
          example: 'E.g.: Urgency (low, medium, critical)',
          action: 'Create a score',
        },
        noul: {
          title: 'Yes / No',
          description: 'Decide a binary question with optional criteria.',
          example: 'E.g.: Is the customer asking for a callback?',
          action: 'Create a yes/no',
        },
      },
      addQuestion: '+ Add a question',
      addQuestionAria: 'Add a question: choose its type',
      addButtons: {
        choice: '+ Category',
        score: '+ Score',
        noul: '+ Yes / No',
      },
      item: {
        newQuestionTitle: 'New question',
        instructionLabel: 'Your question for Jev',
        instructionPlaceholder: 'E.g.: What is the main purpose of this request?',
        typeLabel: 'Question type',
        types: {
          choice: 'Category',
          score: 'Score',
          noul: 'Yes / No',
        },
        typeHelp: {
          choice: 'Defines mutually exclusive options. Jev picks the most relevant one.',
          score: 'Evaluates on an ordered scale from 2 to 10 levels.',
          noul: 'Binary yes/no question. Specify conditions if needed.',
        },
        typeSummary: {
          choice: (count: number) => `Category, ${count} option${count > 1 ? 's' : ''}`,
          score: (count: number) => `Score, ${count} level${count > 1 ? 's' : ''}`,
          noul: () => 'Yes / No',
        },
        errorsBadge: (count: number) =>
          count === 1 ? '1 error' : `${count} errors`,
        warningsBadge: (count: number) =>
          count === 1 ? '1 warning' : `${count} warnings`,
        citation: {
          label: 'Cite a field:',
        },
        choice: {
          optionKeyHeader: 'Option',
          optionDescHeader: 'Description (optional)',
          optionKeyPlaceholder: 'E.g.: quote',
          optionDescPlaceholder: 'E.g.: Price inquiry or proposal',
          addOption: 'Add an option',
          removeOptionAria: (key: string) => `Remove option ${key || 'unnamed'}`,
        },
        score: {
          levelHeader: 'Ordered levels',
          levelPlaceholder: (index: number) => `Level ${index}`,
          addLevel: 'Add a level',
          removeLevelAria: (index: number) => `Remove level ${index}`,
        },
        noul: {
          trueLabel: 'Condition for "Yes" (optional)',
          truePlaceholder: 'E.g.: Text contains an explicit request',
          falseLabel: 'Condition for "No" (optional)',
          falsePlaceholder: 'E.g.: No callback requested',
        },
        keySection: {
          advanced: 'Advanced: n8n key',
          toggle: (key: string) => `Key in n8n: ${key}`,
          label: 'Technical key in JSON',
          help: 'Letters without accents, digits, and underscores without starting with a digit.',
        },
        actions: {
          duplicate: 'Duplicate',
          delete: 'Delete',
          collapse: 'Collapse question',
          expand: 'Expand question',
        },
      },
    },
    output: {
      cardSubtitle: 'Copy the node, paste it into your n8n workflow: the request is already set up.',
      copyNodeHint:
        'The node holds the whole request for Jev. You only need to add your key in n8n (see step 2).',
      copyJsonOnly: 'Copy the JSON only',
      nextStepsTitle: 'Then, in n8n',
      copy: 'Copy JSON',
      copied: 'Copied!',
      copyNode: 'Copy n8n node',
      nodeCopied: 'Node copied!',
      showJson: 'Show the JSON',
      copyNodeDisabledNotice: 'Fix blocking errors below to copy the n8n node.',
      blockingErrorsTitle: 'Errors to fix',
      warningsTitle: 'Warnings',
      helpButtonText: 'Manual setup and troubleshooting',
      barSummaryReady: (count: number) =>
        `${count} question${count === 1 ? '' : 's'} · JSON ready`,
      barSummaryErrors: (count: number) =>
        `${count} error${count === 1 ? '' : 's'} to fix`,
      barViewResult: 'View result',
      barAriaLabel: 'Summary and copy actions',
      barReset: 'Clear all',
      resetConfirmTitle: 'Reset everything?',
      resetConfirmMessage:
        'Your fields, questions and current description will be cleared. Your Claude key and model are not affected.',
      resetConfirmAction: 'Reset',
      resetConfirmCancel: 'Keep my work',
    },
    help: {
      closeAria: 'Close help panel',
      copyNode: 'Copy n8n node',
      nodeCopied: 'Node copied!',
      provider: {
        legend: 'Your Jev access',
        typesafe: 'TypeSafe key',
        vercel: 'Vercel AI Gateway',
        modelLabel: 'Model',
        copied: 'Copied!',
      },
      shortSteps: {
        title: 'Configure Jev in 4 easy steps',
        step1: {
          title: '1. Paste the node',
          desc: 'Click on your n8n workflow canvas, then press **Ctrl+V** (**Cmd+V** on Mac). A "Jev" node appears with all its settings. Connect it to the node providing the text to analyze.',
        },
        step2: {
          title: '2. Add your key (once)',
          desc: 'Open the node; under **Credential for Header Auth**, choose **Create new credential**; set **Name** = `Authorization` and **Value** = `Bearer ` (with a space) followed by your key, then click **Save**. Note: your key stays in n8n’s saved credentials, never in EasyJev nor in the copied node.',
          descTypesafe:
            'Open the node; under **Credential for Header Auth**, choose **Create new credential**; set **Name** = `Authorization` and **Value** = `Bearer ` (with a space) followed by your TypeSafe key (from console.typesafe.ai), then click **Save**. Note: your key stays in n8n’s saved credentials, never in EasyJev nor in the copied node.',
          descVercel:
            'Open the node; under **Credential for Header Auth**, choose **Create new credential**; set **Name** = `Authorization` and **Value** = `Bearer ` (with a space) followed by your Vercel AI Gateway key, then click **Save**. Note: your key stays in n8n’s saved credentials, never in EasyJev nor in the copied node.',
        },
        step3: {
          title: '3. Check',
          desc: 'In the **JSON** field, the `fx` icon is active and the preview shows your text between quotes (the node reads the field from the preceding node: make sure the field name exists in its input data).',
        },
        step4: {
          title: '4. Read answers',
          desc: 'Each question outputs a result ready to use in subsequent nodes (If, Switch, etc.):',
        },
      },
      manual: {
        title: 'Configure manually (if paste does not work)',
        summary: 'Show all 14 manual setup steps',
      },
      steps: {
        title: 'The 14 setup steps',
        groups: {
          node: 'Block 1 — The node',
          auth: 'Block 2 — The key (authentication)',
          headers: 'Block 3 — The header declaring JSON',
          body: 'Block 4 — Sent content',
          reading: 'Block 5 — Read answers',
        },
        step1: {
          title: '1. Add an HTTP Request node',
          desc: 'In your n8n workflow, insert an **HTTP Request** node. This is the node that sends the request to Jev.',
        },
        step2: {
          title: '2. POST Method',
          desc: 'In **Method**, choose **POST** to transmit the data to evaluate.',
        },
        step3: {
          title: '3. Jev URL',
          desc: 'In **URL**, paste Jev’s address according to your chosen provider above: `https://api.typesafe.ai/v1/systemone` (TypeSafe) or `https://ai-gateway.vercel.sh/typesafe/v1/systemone` (Vercel AI Gateway).',
          descTypesafe:
            'In **URL**, paste the TypeSafe API address: `https://api.typesafe.ai/v1/systemone` (or click **Copy URL** above).',
          descVercel:
            'In **URL**, paste the Vercel gateway address: `https://ai-gateway.vercel.sh/typesafe/v1/systemone` (or click **Copy URL** above).',
        },
        step4: {
          title: '4. Generic authentication',
          desc: 'In **Authentication**, choose **Generic Credential Type**.',
        },
        step5: {
          title: '5. Header Auth credential type',
          desc: 'In **Generic Auth Type**, choose **Header Auth** to transmit your key in an HTTP header.',
        },
        step6: {
          title: '6. Create and save credentials',
          desc: 'Create the credential: **Name** = `Authorization`, **Value** = `Bearer ` followed by your key (TypeSafe or Vercel AI Gateway depending on your choice), then click **Save**. Your key stays stored in n8n and is never sent to EasyJev.',
          descTypesafe:
            'Create the credential: **Name** = `Authorization`, **Value** = `Bearer ` followed by your TypeSafe key (from console.typesafe.ai), then click **Save**. Your key stays stored in n8n and is never sent to EasyJev.',
          descVercel:
            'Create the credential: **Name** = `Authorization`, **Value** = `Bearer ` followed by your Vercel AI Gateway key, then click **Save**. Your key stays stored in n8n and is never sent to EasyJev.',
        },
        step7: {
          title: '7. Enable headers',
          desc: 'Toggle on **Send Headers**. A header is metadata describing the transmission to the API.',
        },
        step8: {
          title: '8. Specify headers below',
          desc: 'In **Specify Headers**, choose **Using Fields Below** to define the header manually.',
        },
        step9: {
          title: '9. Add Content-Type header',
          desc: 'Under **Headers**, add an entry with **Name** = `Content-Type` and **Value** = `application/json`. This informs Jev that the sent content is formatted as JSON.',
        },
        step10: {
          title: '10. Enable request body',
          desc: 'Toggle on **Send Body**. The body is the main payload sent to Jev (the fields to analyze and your questions).',
        },
        step11: {
          title: '11. JSON content type',
          desc: 'In **Body Content Type**, choose **JSON**.',
        },
        step12: {
          title: '12. Specify body as JSON',
          desc: 'In **Specify Body**, choose **Using JSON** to paste the JSON payload generated by EasyJev directly.',
        },
        step13: {
          title: '13. Paste JSON in Expression mode',
          desc: 'In **JSON**, paste the JSON copied from EasyJev. Upon pasting, n8n automatically switches the field to Expression mode (`fx` icon on the left, verified on n8n 2.33.4). An n8n expression (wrapped in double braces `{{ ... }}`) dynamically computes the value at runtime. Check the preview below the field: it should display your text between quotes. If the field stays in plain text, click the `fx` icon to switch to Expression manually. With multiple fields, each gets its own expression (e.g. `{{ JSON.stringify($json.message) }}`).',
        },
        step14: {
          title: '14. Read answers',
          desc: 'Each question outputs a result ready to use in subsequent nodes (If, Switch, etc.):',
          copyExpr: 'Copy',
          copied: 'Copied!',
          answerYes: 'Yes',
          answerNo: 'No',
          answerMaybe: 'Maybe',
          yesNoLabel: 'As “Yes” or “No” text:',
          thresholdNote:
            'Jev returns a number: its certainty that the answer is “yes”. To adjust the thresholds (0.5; or 0.7 and 0.3), change the numbers in the expression.',
          typeExpl: {
            noul: 'Numeric value from 0 to 1 (e.g.: test with > 0.5 in an If node)',
            choice: 'Selected option (.choice) and confidence score (.confidence)',
            score: 'Numeric score (.score) and probability breakdown',
          },
        },
        emptyReadingHelp:
          'Configure valid questions in the editor to display tailored reading expressions.',
      },
      troubleshooting: {
        title: 'Troubleshooting',
        errPaste:
          'If pasting does nothing or n8n reports an unknown node: expand the "Configure manually" section above to set up the node step by step.',
        errBody:
          'Unreadable or empty body: verify the Content-Type header (steps 7 to 9) and that the JSON field is in Expression mode (step 13).',
        err401: '401: Missing, mistyped, or expired API key.',
        err422: '422: Malformed request body (missing model or scale outside 2-10).',
        err429: '429 / 529: Rate limit reached or temporary service overload.',
        testCmdTitle: 'Quick key check:',
        testCmd: 'curl -H "Authorization: Bearer <KEY>" https://api.typesafe.ai/v1/models',
      },
    },
  },
  demo: {
    meta: {
      title: 'How it works — EasyJev interactive demo',
      description:
        'See in 30 seconds how EasyJev configures Jev for your n8n workflows, without writing JSON.',
    },
    title: 'How it works',
    subtitle:
      'From your need to a decision in n8n, without writing JSON.',
    notice: 'Demo: fictional data, no connection to n8n or Claude.',
    controls: {
      play: 'Play',
      pause: 'Pause',
      replay: 'Replay',
      stepAria: (index: number, title: string) => `Step ${index}: ${title}`,
      stepsNavAria: 'Demo steps',
    },
    scenes: {
      hook: {
        title: '1. The need',
        legend: 'Jev decides fast, but it expects a very precise JSON. EasyJev writes it for you.',
      },
      describe: {
        title: '2. Describe',
        legend: 'Describe what Jev should decide and paste your data: EasyJev detects the fields.',
      },
      adjust: {
        title: '3. Adjust',
        legend: 'Claude suggests the questions. Tweak them in one click if needed.',
      },
      copy: {
        title: '4. Copy the node',
        legend: 'One click: the full n8n node is copied, request included.',
      },
      run: {
        title: '5. Paste and run',
        legend: 'Paste the node in your workflow, add your key and execute.',
      },
      result: {
        title: '6. Result',
        legend: 'Jev answers for each row. A ready-to-copy expression routes your flow.',
      },
    },
    stage: {
      workflowPane: 'Your workflow',
      easyjevPane: 'EasyJev',
      hookLine1: 'Sorting messages, qualifying leads, rating reviews…',
      hookLine2: 'Jev decides in a split second.',
      hookLine3: 'But it only understands a very precise JSON.',
      hookLine4: 'EasyJev writes it for you.',
      pending: 'to decide',
      nodeTable: 'Spreadsheet',
      nodeTableSub: 'Raw output',
      nodeJev: 'Jev',
      nodeJevSub: 'Decision',
      statusOk: 'OK',
      outputLabel: 'OUTPUT (JSON)',
      itemsCount: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
      dropHere: 'Ctrl+V',
      promptLabel: 'Describe what Jev should decide',
      charCount: (count: number) => `${count} chars`,
      dataLabel: 'Your data',
      fieldDetected: 'Detected fields:',
      generate: 'Generate questions',
      generating: 'Generating…',
      readsField: 'Jev reads:',
      q1Type: 'Category',
      q1Title: 'Game genre',
      q1Instruction: 'Which category does the game `game` belong to?',
      q1Options: ['RPG', 'Racing', 'Simulation'],
      q2Type: 'Yes / No',
      q2Title: 'Confirmed success',
      q2Instruction: 'Does the game `game` have over 1000 reviews?',
      q2True: 'Yes',
      q2False: 'No',
      addOption: '+ option',
      provider: 'TypeSafe key',
      copyNode: 'Copy n8n node',
      nodeCopied: 'Node copied!',
      tokenHint: 'Add your key',
      runWorkflow: 'Execute workflow',
      resultTitle: 'Result',
      readTitle: 'In the next node',
      routeYes: 'Feature it',
      routeNo: 'Archive',
      outroLine: 'Without writing a single line of JSON.',
    },
    tryButton: 'Try EasyJev',
    tryAriaLabel: 'Go to the EasyJev editor',
  },
  validation: validationMessagesEn,
};
