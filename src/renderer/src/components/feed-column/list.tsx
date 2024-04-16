import { useFeeds } from '@renderer/lib/feeds'
import { Collapsible, CollapsibleTrigger } from '@renderer/components/ui/collapsible'
import { m, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { levels } from '@renderer/lib/constants'
import { ActivedList } from '@renderer/lib/types'
import { cn } from '@renderer/lib/utils'
import { SiteIcon } from '../site-icon'

export function FeedList({
  type,
  activedList,
  setActivedList,
}: {
  type: string,
  activedList: ActivedList,
  setActivedList: (value: ActivedList) => void
}) {
  const feeds = useFeeds(type)

  return (
    <div className="w-64 px-3">
      <div
        className={cn('flex items-center justify-between mt-2 mb-3 px-2.5 py-1 rounded cursor-pointer')}
        onClick={(e) => {
          e.stopPropagation()
          setActivedList({
            level: levels.type,
            id: type,
            name: type,
            type,
          })
        }}
      >
        <div className="font-bold">{type}</div>
        <div className='text-sm text-zinc-500 ml-2'>{feeds.data?.unread}</div>
      </div>
      {feeds.data?.list.map((category) => (
        <FeedCategory
          key={category.name}
          data={category}
          activedList={activedList}
          setActivedList={setActivedList}
          type={type}
        />
      ))}
    </div>
  )
}

function FeedCategory({
  data,
  activedList,
  setActivedList,
  type,
}: {
  data: any,
  activedList: ActivedList,
  setActivedList: (value: ActivedList) => void
  type: string,
}) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible
      open={open}
      onOpenChange={(o) => setOpen(o)}
      onClick={(e) => {
        e.stopPropagation()
        setActivedList({
          level: levels.folder,
          id: data.id,
          name: data.name,
          type,
        })
      }}
    >
      <div className={cn("flex items-center justify-between font-medium text-sm leading-loose px-2.5 py-[2px] rounded w-full cursor-pointer", activedList?.level === levels.folder && activedList.id === data.id && 'bg-[#C9C9C7]')}>
        <div className='flex items-center min-w-0'>
          <CollapsibleTrigger className='flex items-center h-7 [&_.i-mingcute-right-fill]:data-[state=open]:rotate-90'>
            <i className="i-mingcute-right-fill mr-2 transition-transform" />
          </CollapsibleTrigger>
          <span className='truncate'>{data.name}</span>
        </div>
        {!!data.unread && <div className='text-xs text-zinc-500 ml-2'>{data.unread}</div>}
      </div>
      <AnimatePresence>
        {open && (
          <m.div
            transition={{
              type: 'tween',
              duration: 0.2,
              ease: 'easeInOut',
            }}
            className="overflow-hidden"
            initial={{
              height: 0,
              opacity: 0
            }}
            animate={{
              height: 'auto',
              opacity: 1
            }}
            exit={{
              height: 0,
              opacity: 0
            }}
          >
            {data.list.map((feed) => (
              <div
                key={feed.id}
                className={cn("flex items-center justify-between text-sm font-medium leading-loose w-full pl-6 pr-2.5 py-[2px] rounded cursor-pointer", activedList?.level === levels.feed && activedList.id === feed.id && 'bg-[#C9C9C7]')}
                onClick={(e) => {
                  e.stopPropagation()
                  setActivedList({
                    level: levels.feed,
                    id: feed.id,
                    name: feed.title,
                    type,
                  })
                }}
              >
                <div className='flex items-center min-w-0'>
                  <SiteIcon url={feed.site_url} className="w-4 h-4" />
                  <div className='truncate'>{feed.title}</div>
                </div>
                {!!feed.unread && <div className='text-xs text-zinc-500 ml-2'>{feed.unread}</div>}
              </div>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}
