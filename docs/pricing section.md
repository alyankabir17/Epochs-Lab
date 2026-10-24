You are given a task to integrate an existing React component in the codebase

The codebase should support:

\- shadcn project structure  

\- Tailwind CSS

\- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 

If default path for components is not /components/ui, provide instructions on why it's important to create this folder

Copy-paste this component to /components/ui folder:

\`\`\`tsx

pricing-module.tsx

"use client";

import \* as React from "react";

import {

Card,

CardHeader,

CardTitle,

CardDescription,

CardContent,

} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PlanFeature {

label: string;

included: boolean;

}

export interface PricingPlan {

id: string;

name: string;

description: string;

icon: React.ReactNode;

priceMonthly: number;

priceYearly: number;

users: string;

features: PlanFeature\[\];

recommended?: boolean;

}

export interface PricingModuleProps {

title?: string;

subtitle?: string;

annualBillingLabel?: string;

buttonLabel?: string;

plans: PricingPlan\[\];

defaultAnnual?: boolean;

className?: string;

}

export function PricingModule({

title = "Pricing Plans",

subtitle = "Choose a plan that fits your needs.",

annualBillingLabel = "Annual billing",

buttonLabel = "Get started",

plans,

defaultAnnual = false,

className,

}: PricingModuleProps) {

const \[isAnnual, setIsAnnual\] = React.useState(defaultAnnual);

return (

\<section

className={cn(

"w-full bg-background text-foreground py-20 px-4 md:px-8",

className

)}

\>

\<div className="max-w-6xl mx-auto text-center"\>

\<h2 className="text-4xl font-bold tracking-tight mb-2"\>{title}\</h2\>

\<p className="text-muted-foreground mb-8"\>{subtitle}\</p\>

{/\* Toggle \*/}

\<div className="flex items-center justify-center gap-2 mb-10"\>

\<Switch

id="billing-toggle"

checked={isAnnual}

onCheckedChange={(checked) =\> setIsAnnual(checked)}

/\>

\<label

htmlFor="billing-toggle"

className="text-sm text-muted-foreground cursor-pointer"

\>

{annualBillingLabel}

\</label\>

\</div\>

{/\* Pricing Cards \*/}

\<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"\>

{plans.map((plan) =\> (

\<Card

key={plan.id}

className={cn(

"relative border border-muted rounded-xl transition-all hover:shadow-md hover:border-primary/30",

plan.recommended \&\& "border-primary ring-1 ring-primary/30 scale-\[1.03\]"

)}

\>

{plan.recommended \&\& (

\<div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full"\>

Recommended

\</div\>

)}

\<CardHeader className="text-center pt-8"\>

\<div className="flex justify-center mb-4"\>{plan.icon}\</div\>

\<CardTitle\>{plan.name}\</CardTitle\>

\<CardDescription\>{plan.description}\</CardDescription\>

\</CardHeader\>

\<CardContent className="text-center"\>

\<div className="text-3xl font-bold mb-2 transition-all duration-300"\>

${isAnnual ? plan.priceYearly : plan.priceMonthly}

\</div\>

\<p className="text-sm text-muted-foreground mb-4"\>

/ {isAnnual ? "year" : "month"}

\</p\>

\<Button

variant={plan.recommended ? "default" : "outline"}

className="w-full mb-6"

\>

{buttonLabel}

\</Button\>

\<div className="text-left text-sm"\>

\<h4 className="font-semibold mb-2"\>Overview\</h4\>

\<p className="text-muted-foreground mb-4"\>✓ {plan.users}\</p\>

\<h4 className="font-semibold mb-2"\>Highlights\</h4\>

\<ul className="space-y-2"\>

{plan.features.map((f, i) =\> (

\<li key={i} className="flex items-center gap-2"\>

{f.included ? (

\<Check className="w-4 h-4 text-primary" /\>

) : (

\<X className="w-4 h-4 text-muted-foreground" /\>

)}

\<span

className={f.included

? "text-muted-foreground"

: "text-muted-foreground/60 line-through"}

\>

{f.label}

\</span\>

\</li\>

))}

\</ul\>

\</div\>

\</CardContent\>

\</Card\>

))}

\</div\>

\</div\>

\</section\>

);

}

demo.tsx

"use client";

import { PricingModule } from "@/components/ui/pricing-module";

import { Layers, Monitor, Users, Building2 } from "lucide-react";

export default function PricingPage() {

const plans = \[

{

id: "free",

name: "Free",

description: "For individuals and small projects",

icon: \<Layers className="w-8 h-8 text-primary" /\>,

priceMonthly: 9,

priceYearly: 90,

users: "Up to 3 users",

features: \[

{ label: "Basic analytics", included: true },

{ label: "Community access", included: true },

{ label: "Priority support", included: false },

\],

},

{

id: "basic",

name: "Basic",

description: "For small teams getting started",

icon: \<Monitor className="w-8 h-8 text-primary" /\>,

priceMonthly: 29,

priceYearly: 290,

users: "Up to 10 users",

features: \[

{ label: "Advanced analytics", included: true },

{ label: "Priority support", included: true },

{ label: "Team collaboration tools", included: false },

\],

},

{

id: "team",

name: "Team",

description: "For growing startups and agencies",

icon: \<Users className="w-8 h-8 text-primary" /\>,

priceMonthly: 99,

priceYearly: 990,

users: "Up to 50 users",

features: \[

{ label: "Dedicated success manager", included: true },

{ label: "Custom integrations", included: true },

{ label: "AI-powered insights", included: true },

\],

recommended: true,

},

{

id: "enterprise",

name: "Enterprise",

description: "For large organizations with custom needs",

icon: \<Building2 className="w-8 h-8 text-primary" /\>,

priceMonthly: 199,

priceYearly: 1990,

users: "Unlimited users",

features: \[

{ label: "24/7 priority support", included: true },

{ label: "Custom SLAs", included: true },

{ label: "Private cloud hosting", included: true },

\],

},

\];

return (

\<main className="min-h-screen bg-background text-foreground"\>

\<PricingModule

title="Simple, Transparent Pricing"

subtitle="Switch between monthly and yearly billing anytime."

annualBillingLabel="Pay annually and save 20%"

buttonLabel="Start Now"

plans={plans}

defaultAnnual={false}

/\>

\</main\>

);

}

\`\`\`

Copy-paste these files for dependencies:

\`\`\`tsx

shadcn/button

import \* as React from "react"

import { Slot } from "@radix-ui/react-slot"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(

"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

{

variants: {

variant: {

default: "bg-primary text-primary-foreground hover:bg-primary/90",

destructive:

"bg-destructive text-destructive-foreground hover:bg-destructive/90",

outline:

"border border-input bg-background hover:bg-accent hover:text-accent-foreground",

secondary:

"bg-secondary text-secondary-foreground hover:bg-secondary/80",

ghost: "hover:bg-accent hover:text-accent-foreground",

link: "text-primary underline-offset-4 hover:underline",

},

size: {

default: "h-10 px-4 py-2",

sm: "h-9 rounded-md px-3",

lg: "h-11 rounded-md px-8",

icon: "h-10 w-10",

},

},

defaultVariants: {

variant: "default",

size: "default",

},

},

)

export interface ButtonProps

extends React.ButtonHTMLAttributes\<HTMLButtonElement\>,

VariantProps\<typeof buttonVariants\> {

asChild?: boolean

}

const Button = React.forwardRef\<HTMLButtonElement, ButtonProps\>(

({ className, variant, size, asChild = false, ...props }, ref) =\> {

const Comp = asChild ? Slot : "button"

return (

\<Comp

className={cn(buttonVariants({ variant, size, className }))}

ref={ref}

{...props}

/\>

)

},

)

Button.displayName = "Button"

export { Button, buttonVariants }

\`\`\`

\`\`\`tsx

shadcn/card

import \* as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef\<

HTMLDivElement,

React.HTMLAttributes\<HTMLDivElement\>

\>(({ className, ...props }, ref) =\> (

\<div

ref={ref}

className={cn(

"rounded-lg border bg-card text-card-foreground shadow-sm",

className,

)}

{...props}

/\>

))

Card.displayName = "Card"

const CardHeader = React.forwardRef\<

HTMLDivElement,

React.HTMLAttributes\<HTMLDivElement\>

\>(({ className, ...props }, ref) =\> (

\<div

ref={ref}

className={cn("flex flex-col space-y-1.5 p-6", className)}

{...props}

/\>

))

CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef\<

HTMLParagraphElement,

React.HTMLAttributes\<HTMLHeadingElement\>

\>(({ className, ...props }, ref) =\> (

\<h3

ref={ref}

className={cn(

"text-2xl font-semibold leading-none tracking-tight",

className,

)}

{...props}

/\>

))

CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef\<

HTMLParagraphElement,

React.HTMLAttributes\<HTMLParagraphElement\>

\>(({ className, ...props }, ref) =\> (

\<p

ref={ref}

className={cn("text-sm text-muted-foreground", className)}

{...props}

/\>

))

CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef\<

HTMLDivElement,

React.HTMLAttributes\<HTMLDivElement\>

\>(({ className, ...props }, ref) =\> (

\<div ref={ref} className={cn("p-6 pt-0", className)} {...props} /\>

))

CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef\<

HTMLDivElement,

React.HTMLAttributes\<HTMLDivElement\>

\>(({ className, ...props }, ref) =\> (

\<div

ref={ref}

className={cn("flex items-center p-6 pt-0", className)}

{...props}

/\>

))

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

\`\`\`

\`\`\`tsx

jolbol1/switch

"use client"

import \* as React from "react"

import {

Switch as AriaSwitch,

SwitchProps as AriaSwitchProps,

composeRenderProps,

} from "react-aria-components"

import { cn } from "@/lib/utils"

const Switch = ({ children, className, ...props }: AriaSwitchProps) =\> (

\<AriaSwitch

className={composeRenderProps(className, (className) =\>

cn(

"group inline-flex items-center gap-2 text-sm font-medium leading-none data-\[disabled\]:cursor-not-allowed data-\[disabled\]:opacity-70",

className

)

)}

{...props}

\>

{composeRenderProps(children, (children) =\> (

\<\>

\<div

className={cn(

"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",

/\* Focus Visible \*/

"group-data-\[focus-visible\]:outline-none group-data-\[focus-visible\]:ring-2 group-data-\[focus-visible\]:ring-ring group-data-\[focus-visible\]:ring-offset-2 group-data-\[focus-visible\]:ring-offset-background",

/\* Disabled \*/

"group-data-\[disabled\]:cursor-not-allowed group-data-\[disabled\]:opacity-50",

/\* Selected \*/

"bg-input group-data-\[selected\]:bg-primary",

/\* Readonly \*/

"group-data-\[readonly\]:cursor-default",

/\* Resets \*/

"focus-visible:outline-none"

)}

\>

\<div

className={cn(

"pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform",

/\* Selected \*/

"translate-x-0 group-data-\[selected\]:translate-x-5"

)}

/\>

\</div\>

{children}

\</\>

))}

\</AriaSwitch\>

)

export { Switch }

\`\`\`

Install NPM dependencies:

\`\`\`bash

lucide-react, @radix-ui/react-slot, class-variance-authority, react-aria-components

\`\`\`

Implementation Guidelines

1\. Analyze the component structure and identify all required dependencies

2\. Review the component's argumens and state

3\. Identify any required context providers or hooks and install them

4\. Questions to Ask

\- What data/props will be passed to this component?

\- Are there any specific state management requirements?

\- Are there any required assets (images, icons, etc.)?

\- What is the expected responsive behavior?

\- What is the best place to use this component in the app?

Steps to integrate

0\. Copy paste all the code above in the correct directories

1\. Install external dependencies

2\. Fill image assets with Unsplash stock images you know exist

3\. Use lucide-react icons for svgs or logos if component requires them
