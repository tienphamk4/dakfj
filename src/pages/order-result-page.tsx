import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Descriptions, Result } from 'antd'
import type { OrderResponse } from '@/types'

export default function OrderResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const stateOrder = location.state?.order as OrderResponse | undefined
  const statePaymentMethod = location.state?.paymentMethod as string | undefined

  // COD success path — arrived via navigate from order-confirm-page
  if (statePaymentMethod === 'COD' && stateOrder) {
    return (
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle={`Mã đơn hàng: ${stateOrder.code} — Cảm ơn bạn đã mua hàng!`}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      >
        <Descriptions bordered size="small" column={1} style={{ maxWidth: 400, margin: '0 auto' }}>
          <Descriptions.Item label="Mã đơn">{stateOrder.code}</Descriptions.Item>
          <Descriptions.Item label="Tổng thanh toán">
            {stateOrder.total.toLocaleString('vi-VN')}₫
          </Descriptions.Item>
          <Descriptions.Item label="Hình thức">Thanh toán khi nhận hàng</Descriptions.Item>
        </Descriptions>
      </Result>
    )
  }

  // VNPAY callback path — arrived via redirect from VNPAY gateway
  const responseCode = params.get('vnp_ResponseCode')
  const success = responseCode === '00'

  return (
    <Result
      status={success ? 'success' : 'error'}
      title={success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
      subTitle={
        success
          ? 'Đơn hàng của bạn đã được thanh toán. Cảm ơn bạn đã mua hàng!'
          : 'Giao dịch không thành công hoặc bị hủy. Vui lòng thử lại.'
      }
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>,
      ]}
    />
  )
}

