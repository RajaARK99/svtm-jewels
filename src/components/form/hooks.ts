import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Combobox } from "./combobox";
import { DatePicker } from "./datePicker";
import { Input } from "./input";
import { Multiselect } from "./multiselect";
import { NumberInput } from "./number-input";
import { SubscribeButton } from "./subscribeButton";
import { TextArea } from "./textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input,
    TextArea,
    Combobox,
    DatePicker,
    Multiselect,
    NumberInput,
  },
  formComponents: {
    SubscribeButton,
  },
});

export { useAppForm, withForm };
