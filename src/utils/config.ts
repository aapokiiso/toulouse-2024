/**
 * Whether the blog has been archived, i.e. the trip is no longer ongoing.
 *
 * @returns {boolean}
 */
export const isArchived = (): boolean => process.env.NEXT_PUBLIC_ARCHIVED === '1'

/**
 * Whether random sample metadata is used for album images.
 * Useful for trying out an existing album where images don't have the necessary metadata.
 *
 * @returns {boolean}
 */
export const isSampleMetadata = (): boolean => process.env.NEXT_PUBLIC_SAMPLE_METADATA === '1'
