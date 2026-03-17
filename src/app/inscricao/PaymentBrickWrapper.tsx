"use client";

import { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

export default function PaymentBrickWrapper({ initialization, onSubmit, customization }: any) {
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string, { locale: 'pt-BR' });
  }, []);

  return <Payment initialization={initialization} onSubmit={onSubmit} customization={customization} />;
}
