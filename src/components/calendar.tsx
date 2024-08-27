import {
  Calendar as RNCalendar,
  CalendarProps,
  LocaleConfig,
} from "react-native-calendars"
import { ptBR } from "@/utils/localeCalendarConfig"

LocaleConfig.locales["pt-br"] = ptBR
LocaleConfig.defaultLocale = "pt-br"

import { colors } from "@/styles/colors"
import { fontFamily } from "@/styles/fontFamily"

export function Calendar({ ...rest }: CalendarProps) {
  return (
    <RNCalendar
      hideExtraDays
      style={{
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
      theme={{
        textMonthFontSize: 18,
        selectedDayBackgroundColor: colors.blue[300],
        selectedDayTextColor: colors.neutral[900],
        textDayFontFamily: fontFamily.regular,
        monthTextColor: colors.neutral[200],
        arrowColor: colors.neutral[400],
        agendaDayNumColor: colors.neutral[200],
        todayTextColor: colors.blue[300],
        textDisabledColor: colors.neutral[500],
        calendarBackground: "transparent",
        textDayStyle: { color: colors.neutral[200] },
      }}
      {...rest}
    />
  )
}
