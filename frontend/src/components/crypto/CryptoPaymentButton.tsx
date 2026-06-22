import React, { useState } from 'react';
import { Button, Text, Box, Spinner } from '@chakra-ui/react';
import axios from '../../apis/axios';

type PaymentStatus = 'idle' | 'pending' | 'paid' | 'failed';

interface CryptoPaymentButtonProps {
  amount: string;
  onPaymentSuccess?: () => void;
  onPaymentFailure?: () => void;
}

const POLL_INTERVAL = 1500;
const MAX_POLLS = 10;

const CryptoPaymentButton: React.FC<CryptoPaymentButtonProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState('');

  const pollStatus = async (paymentId: string) => {
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      const { data } = await axios.get(`/crypto/status/${paymentId}`);
      if (data.status === 'paid') {
        setStatus('paid');
        onPaymentSuccess && onPaymentSuccess();
        return;
      }
      if (data.status === 'failed') {
        setStatus('failed');
        onPaymentFailure && onPaymentFailure();
        return;
      }
    }
    setStatus('failed');
    setError('Payment timed out. Please try again.');
    onPaymentFailure && onPaymentFailure();
  };

  const handlePay = async () => {
    setError('');
    setStatus('pending');
    try {
      const { data } = await axios.post('/crypto/create_session', {
        amount,
        currency: 'USDT',
      });
      if (data.status === 'failed') {
        setStatus('failed');
        setError('Could not start the payment. Please check the amount.');
        onPaymentFailure && onPaymentFailure();
        return;
      }
      await pollStatus(data.paymentId);
    } catch (err) {
      console.error('Crypto payment error:', err);
      setStatus('failed');
      setError('Something went wrong starting the payment.');
      onPaymentFailure && onPaymentFailure();
    }
  };

  return (
    <Box mt={3} textAlign="center">
      <Button
        colorScheme="yellow"
        width="100%"
        isLoading={status === 'pending'}
        loadingText="Waiting for payment"
        isDisabled={status === 'pending' || status === 'paid'}
        onClick={handlePay}
      >
        Pay with Binance Pay
      </Button>

      {status === 'pending' && (
        <Text mt={2} color="gray.600" fontSize="sm">
          <Spinner size="xs" mr={2} />
          Payment pending...
        </Text>
      )}
      {status === 'paid' && (
        <Text mt={2} color="green.500" fontSize="sm">
          Payment confirmed.
        </Text>
      )}
      {status === 'failed' && (
        <Text mt={2} color="red.500" fontSize="sm">
          {error || 'Payment failed.'}
        </Text>
      )}
    </Box>
  );
};

export default CryptoPaymentButton;
