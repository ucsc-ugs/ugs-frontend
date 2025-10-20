import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyPayment } from '@/lib/api';
import jsPDF from 'jspdf';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null);

  // Fallback payment details for display during verification
  const [fallbackDetails, setFallbackDetails] = useState({
    orderId: '',
    examName: '',
    amount: '',
  });

  useEffect(() => {
    // Extract order_id from URL query parameters
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      setVerificationError('No order ID found in URL parameters');
      setIsVerifying(false);
      return;
    }

    // Extract basic details for display during verification
    const transactionId = searchParams.get('transaction_id') || searchParams.get('payment_id') || orderId;
    const examName = searchParams.get('exam_name') || localStorage.getItem('exam_name') || 'Exam Registration';
    const amount = searchParams.get('amount') || localStorage.getItem('payment_amount') || '0.00';
    
    setFallbackDetails({
      orderId: transactionId,
      examName,
      amount,
    });

    // Verify payment with backend using order_id
    verifyPaymentWithBackend(orderId);
  }, [searchParams]);

  const verifyPaymentWithBackend = async (orderId: string) => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      const verificationData = await verifyPayment(orderId);
      console.log('PaymentSuccess: Full API response:', verificationData);
      console.log('PaymentSuccess: verificationData.data:', (verificationData as any).data);
      console.log('PaymentSuccess: verificationData.data.payment:', (verificationData as any).data?.payment);
      console.log('PaymentSuccess: typeof verificationData:', typeof verificationData);
      console.log('PaymentSuccess: Object.keys(verificationData):', Object.keys(verificationData));
      
      setVerifiedPayment(verificationData);

      // Clear sensitive data from localStorage after successful verification
      localStorage.removeItem('payment_amount');
      localStorage.removeItem('exam_name');
      localStorage.removeItem('exam_date');
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setVerificationError(error.message || 'Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetryVerification = () => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      verifyPaymentWithBackend(orderId);
    } else {
      setVerificationError('No order ID found for retry');
    }
  };

  const handleDownloadReceipt = () => {
    if (!verifiedPayment || !verifiedPayment.data?.payment) {
      console.error('PaymentSuccess: Cannot download receipt - missing payment data');
      return;
    }

    const paymentDate = verifiedPayment.data.payment.created_at 
      ? new Date(verifiedPayment.data.payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Date not available';

    // Create PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    
    // Add header
    doc.text('PAYMENT RECEIPT', 105, 30, { align: 'center' });
    
    // Add university info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('University of Colombo School of Computing', 105, 45, { align: 'center' });
    
    // Add separator line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 55, 190, 55);
    
    // Receipt details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    let yPosition = 75;
    const leftColumn = 25;
    const rightColumn = 110;
    
    // Payment ID
    doc.text('Payment ID:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(verifiedPayment.data.payment.payment_id || 'N/A', rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Exam Name
    doc.text('Exam:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(verifiedPayment.data.exam_name || 'N/A', rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Amount
    doc.text('Amount Paid:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    const amount = `${verifiedPayment.data.payment.currency || ''} ${verifiedPayment.data.payment.amount || 'N/A'}`;
    doc.text(amount, rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Payment Date
    doc.text('Payment Date:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentDate, rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Index Number
    doc.text('Index Number:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(verifiedPayment.data.index_number || 'N/A', rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Registration Status
    doc.text('Registration Status:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(verifiedPayment.data.registration_status || 'N/A', rightColumn, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    
    // Payment Status
    doc.text('Status:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(verifiedPayment.data.payment.status_message || 'N/A', rightColumn, yPosition);
    
    // Add separator line
    yPosition += 25;
    doc.line(20, yPosition, 190, yPosition);
    
    // Add footer
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your payment!', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.text('This is an electronically generated receipt.', 105, yPosition, { align: 'center' });
    
    // Add timestamp
    yPosition += 20;
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPosition, { align: 'center' });
    
    // Download the PDF
    const filename = `receipt-${verifiedPayment.data.payment.payment_id || 'payment'}.pdf`;
    doc.save(filename);
  };

  // Verification loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">Verifying Payment</h2>
                  <p className="text-gray-600">
                    Please wait while we verify your payment with our secure servers...
                  </p>
                  {fallbackDetails.examName && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      Exam: {fallbackDetails.examName}
                    </p>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification error state
  if (verificationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="shadow-lg border-red-200">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                  <p className="text-gray-600">
                    We encountered an issue while verifying your payment.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{verificationError}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button onClick={handleRetryVerification} className="w-full">
                    Retry Verification
                  </Button>
                  <Button 
                    onClick={() => navigate('/portal/my-exams')} 
                    variant="outline" 
                    className="w-full"
                  >
                    Go to My Exams
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment verified successfully - show success page
  if (verifiedPayment) {
    console.log('PaymentSuccess: Rendering success page with verifiedPayment:', verifiedPayment);
    console.log('PaymentSuccess: verifiedPayment.data exists?', !!verifiedPayment.data);
    console.log('PaymentSuccess: verifiedPayment.data.payment exists?', !!verifiedPayment.data?.payment);
    
    // Safety check for payment object
    if (!verifiedPayment.data?.payment) {
      console.error('PaymentSuccess: payment object is missing from API response');
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <Card className="shadow-lg border-red-200">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">Response Format Error</h2>
                    <p className="text-gray-600">
                      The payment verification response is missing payment details.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">Payment object is undefined in API response</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/portal/my-exams')} className="w-full">
                    Go to My Exams
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    const formattedPaymentDate = verifiedPayment.data.payment.created_at 
      ? new Date(verifiedPayment.data.payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Date not available';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Verified!</h1>
            <p className="text-lg text-gray-600">
              Your exam registration payment has been successfully verified.
            </p>
          </div>

          {/* Payment Details Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-gray-800">
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-lg font-mono bg-gray-50 p-2 rounded border">
                    {verifiedPayment.data?.payment?.payment_id || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                  <p className="text-lg font-semibold text-green-600 bg-green-50 p-2 rounded border">
                    {verifiedPayment.data?.payment?.currency || ''} {verifiedPayment.data?.payment?.amount || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Exam</label>
                  <p className="text-lg bg-gray-50 p-2 rounded border">
                    {verifiedPayment.data?.exam_name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <p className="text-lg bg-gray-50 p-2 rounded border">
                    {formattedPaymentDate}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Index Number</label>
                  <p className="text-lg bg-gray-50 p-2 rounded border">
                    {verifiedPayment.data?.index_number || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Registration Status</label>
                  <p className={`text-lg p-2 rounded border font-medium ${
                    verifiedPayment.data?.registration_status?.toLowerCase() === 'confirmed' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {verifiedPayment.data?.registration_status || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Payment Status</span>
                </div>
                <p className="text-blue-700 mt-1">{verifiedPayment.data?.payment?.status_message || 'Status not available'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Download Receipt</span>
            </Button>
            
            <Button
              onClick={() => navigate('/portal/my-exams')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <span>Go to My Exams</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Additional Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please save or download your receipt for your records</li>
              <li>• You will receive a confirmation email shortly</li>
              <li>• Check your exam schedule in the "My Exams" section</li>
              <li>• Contact support if you have any questions about your payment</li>
            </ul>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/portal')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // This should not happen, but just in case
  return null;
};

export default PaymentSuccess;
