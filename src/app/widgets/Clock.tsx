import Panel from "app/components/Panel";
import { schemaMessages } from "app/locale/common";
import { MyMessageDescriptor } from "app/locale/MyMessageDescriptor";
import { enumToValue } from "app/utils/enum";
import Schema, { type } from "app/utils/Schema";
import { Vector2 } from "app/utils/Vector2";
import { themeMessages, Widget, WidgetProps, WidgetTheme } from "app/Widget";
import React, { CSSProperties, useRef, useState } from "react";
import { defineMessages, FormattedTime, IntlShape, useIntl } from "react-intl";


enum DateStyle {
	None,
	Full,
	Long,
	Medium,
	Short,
	ISO,
}


const messages = defineMessages({
	title: {
		defaultMessage: "Clock",
		description: "Clock Widget",
	},

	description: {
		defaultMessage: "Shows the time",
	},

	editHint: {
		defaultMessage: "The time is based on your system's timezone. If the time is wrong, make sure that you have the timezone set correctly in your computer and browser settings.",
		description: "Clock widget: edit hint",
	},

	showSeconds: {
		defaultMessage: "Show seconds",
	},

	hour12: {
		defaultMessage: "12 hour clock",
	},

	showDate: {
		defaultMessage: "Date style",
		description: "Clock widget: date style form field label",
	},
});


const dateStyleMessages = defineMessages({
	[DateStyle.None]: {
		defaultMessage: "None",
		description: "Clock widget: date style type, not shown",
	},

	[DateStyle.Full]: {
		defaultMessage: "Extended ({example})",
		description: "Clock widget: date style type",
	},

	[DateStyle.Long]: {
		defaultMessage: "Standard ({example})",
		description: "Clock widget: date style type",
	},

	[DateStyle.Medium]: {
		defaultMessage: "Abbreviated ({example})",
		description: "Clock widget: date style type",
	},

	[DateStyle.Short]: {
		defaultMessage: "Numbers ({example})",
		description: "Clock widget: date style type",
	},

	[DateStyle.ISO]: {
		defaultMessage: "ISO ({example})",
		description: "Clock widget: date style type",
	},
});


function renderDate(intl: IntlShape, date: Date, dateStyle: DateStyle): string {
	const dateStyleString = DateStyle[dateStyle].toLowerCase() as any
	if (dateStyle == DateStyle.ISO) {
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = (date.getDate()).toString().padStart(2, "0");
		return `${date.getFullYear()}-${month}-${day}`;
	} else if (intl.locale == "en") {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: dateStyleString
		} as any).format(date);
	} else {
		return intl.formatDate(date, {
			dateStyle: dateStyleString,
		});
	}
}


interface ClockProps {
	showSeconds: boolean;
	hour12: boolean;
	dateStyle: DateStyle;
}

export default function Clock(widget: WidgetProps<ClockProps>) {
	const props = widget.props;
	const [time, setTime] = React.useState<Date>(new Date());
	const intl = useIntl();
	const ref = useRef<HTMLDivElement>(null);
	const [fontSize, setFontSize] = useState<number | undefined>(undefined);

	React.useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());

			if (ref.current) {
				const desiredHeight = ref.current.clientHeight * 0.9;
				const widthToHeight = ref.current.clientWidth / 2.5;
				setFontSize(Math.min(desiredHeight, widthToHeight));
			}
		}, 500);

		return () => {
			clearInterval(timer);
		};
	}, []);

	const dateStyle = enumToValue(DateStyle, props.dateStyle);
	const style: CSSProperties = {
		fontSize: fontSize ? `${fontSize}px` : undefined,
	};

	return (
		<Panel {...widget.theme} scrolling={false}>
			<div className="middle-center" ref={ref}>
				<div>
					<span className="time" style={style}>
						<FormattedTime
							value={time}
							hour="numeric" minute="numeric"
							second={props.showSeconds ? "numeric" : undefined}
							hourCycle={props.hour12 ? "h12" : "h23"} />
					</span>
					<span className="date">
						{dateStyle != undefined && dateStyle != DateStyle.None &&
							renderDate(intl, time, dateStyle)}
					</span>
				</div>
			</div>
		</Panel>);
}

Clock.title = messages.title;
Clock.description = messages.description;
Clock.editHint = messages.editHint;

Clock.initialProps = {
	showSeconds: false,
	hour12: false,
	dateStyle: DateStyle.None,
};

Clock.schema = async (_widget: Widget<any>, intl: IntlShape) => {
	const dateStyleMessagesWithExamples: Record<string, MyMessageDescriptor> = {};
	dateStyleMessagesWithExamples[DateStyle.None] = dateStyleMessages[DateStyle.None];
	Object.entries(dateStyleMessages)
		.filter(([key]) => parseInt(key) != DateStyle.None)
		.forEach(([key, value]) => {
			dateStyleMessagesWithExamples[key] = {
				...value,
				values: {
					example: renderDate(intl, new Date(), parseInt(key)),
				}
			} as MyMessageDescriptor;
		});

	return {
		showSeconds: type.boolean(messages.showSeconds),
		hour12: type.boolean(messages.hour12),
		dateStyle: type.selectEnum(DateStyle, dateStyleMessagesWithExamples, messages.showDate),
	} as Schema;
}
Clock.defaultSize = new Vector2(15, 2);

Clock.initialTheme = {
	showPanelBG: false,
	textColor: "#ffffff",
} as WidgetTheme;

Clock.themeSchema = {
	showPanelBG: type.boolean(themeMessages.showPanelBG),
	textColor: type.color(schemaMessages.textColor),
} as Schema;


Clock.onLoaded = async (widget: Widget<ClockProps>) => {
	if (typeof widget.theme.textColor === "undefined") {
		widget.theme.textColor = "#ffffff";
	}
	if (typeof widget.props.dateStyle == "undefined") {
		widget.props.dateStyle = DateStyle.None;
	}
};
