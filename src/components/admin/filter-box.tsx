import { useState } from 'react'
import { Button, Col, Row } from 'antd'
import { FilterOutlined } from '@ant-design/icons'

interface FilterBoxProps {
  children: React.ReactNode
  onSearch: () => void
  onReset?: () => void
  defaultOpen?: boolean
  extraTopContent?: React.ReactNode
}

export default function FilterBox({ children, onSearch, onReset, defaultOpen = false, extraTopContent }: FilterBoxProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: open ? 12 : 0 }}>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setOpen(v => !v)}
          type={open ? 'primary' : 'default'}
        >
          Tìm kiếm
        </Button>
      </div>

      {extraTopContent && <div style={{ marginBottom: 12 }}>{extraTopContent}</div>}

      {open && (
        <div
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            padding: '16px 16px 8px',
            background: '#fafafa',
          }}
        >
          <Row gutter={[16, 16]}>
            {children}
          </Row>
          <Row justify="end" style={{ marginTop: 12 }}>
            <Col>
              <Button style={{ marginRight: 8 }} onClick={onReset}>Đặt lại</Button>
              <Button type="primary" onClick={onSearch}>Tìm kiếm</Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}
