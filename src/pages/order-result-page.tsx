import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Result } from 'antd'
import type { OrderResponse } from '@/types'
import './order-result-page.css'

export default function OrderResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isSuccessRoute = location.pathname === '/order/success'
  const isErrorRoute = location.pathname === '/order/error'
  const isLegacyResultRoute = location.pathname === '/order/result'

  const stateOrder = location.state?.order as OrderResponse | undefined
  const statePaymentMethod = location.state?.paymentMethod as string | undefined

  if (isLegacyResultRoute) {
    if (statePaymentMethod === 'COD') {
      return (
        <Navigate
          to="/order/success"
          replace
          state={{ order: stateOrder, paymentMethod: 'COD' }}
        />
      )
    }

    const responseCode = params.get('vnp_ResponseCode')
    return <Navigate to={responseCode === '00' ? '/order/success' : '/order/error'} replace />
  }

  if (isSuccessRoute) {
    return (
      <div className="orp-page">
        <Result
          className=""
          status="success"
          title="Đặt hàng thành công!"
          subTitle={
            stateOrder
              ? `Cảm ơn bạn đã mua hàng!`
              : 'Đơn hàng đã được ghi nhận thành công. Cảm ơn bạn đã mua hàng!'
          }
          extra={[
            <Button className="orp-home-btn" type="primary" key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        >
          {/* <Descriptions bordered size="small" column={1} className="orp-descriptions">
            <Descriptions.Item label="Mã đơn">{stateOrder.code}</Descriptions.Item>
            <Descriptions.Item label="Tổng thanh toán">
              {stateOrder.total.toLocaleString('vi-VN')}₫
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức">Thanh toán khi nhận hàng</Descriptions.Item>
          </Descriptions> */}
        </Result>
      </div>
    )
  }

  if (isErrorRoute) {
    return (
      <div className="orp-page">
        <Result
          className=""
          status="error"
          title="Thanh toán thất bại"
          subTitle="Giao dịch không thành công hoặc bị hủy. Vui lòng thử lại."
          extra={[
            <Button className="orp-home-btn" type="primary" key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="orp-page">
      <Result
        className=""
        status="error"
        title="Không tìm thấy kết quả đơn hàng"
        subTitle="Đường dẫn không hợp lệ. Vui lòng quay lại trang chủ hoặc thử đặt hàng lại."
        extra={[
          <Button className="orp-home-btn" type="primary" key="home" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  )
}

