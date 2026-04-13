import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CheckoutStep = 1 | 2 | 3;
export type DeliveryOption = "pickup" | "shipping";

export type CheckoutAddress = {
  cep: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
};

export type CheckoutState = {
  step: CheckoutStep;
  deliveryOption: DeliveryOption;
  shippingCost: number;
  address: CheckoutAddress;
  customer: CheckoutCustomer;
};

type CheckoutStore = CheckoutState & {
  setStep: (step: CheckoutStep) => void;
  setDeliveryOption: (deliveryOption: DeliveryOption) => void;
  setShippingCost: (shippingCost: number) => void;
  updateAddress: (address: Partial<CheckoutAddress>) => void;
  updateCustomer: (customer: Partial<CheckoutCustomer>) => void;
  resetCheckout: () => void;
};

const defaultState: CheckoutState = {
  step: 1,
  deliveryOption: "pickup",
  shippingCost: 0,
  address: {
    cep: "",
    street: "",
    neighborhood: "",
    number: "",
    city: "",
    state: "SC",
  },
  customer: {
    name: "",
    email: "",
    cpf: "",
    phone: "",
  },
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setStep: (step) => set({ step }),
      setDeliveryOption: (deliveryOption) => set({ deliveryOption }),
      setShippingCost: (shippingCost) => set({ shippingCost }),
      updateAddress: (address) =>
        set((state) => ({
          address: {
            ...state.address,
            ...address,
          },
        })),
      updateCustomer: (customer) =>
        set((state) => ({
          customer: {
            ...state.customer,
            ...customer,
          },
        })),
      resetCheckout: () => set(defaultState),
    }),
    {
      name: "garimpo-checkout-storage",
      partialize: (state) => ({
        step: state.step,
        deliveryOption: state.deliveryOption,
        shippingCost: state.shippingCost,
        address: state.address,
        customer: state.customer,
      }),
    },
  ),
);
