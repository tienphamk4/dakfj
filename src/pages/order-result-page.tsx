import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Result } from 'antd'

export default function OrderResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const responseCode = params.get('vnp_ResponseCode')
  const success = responseCode === '00'

  return (
    <Result
      status={success ? 'success' : 'error'}
      title={success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
      subTitle={
        success
          ? 'Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua hàng!'
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
