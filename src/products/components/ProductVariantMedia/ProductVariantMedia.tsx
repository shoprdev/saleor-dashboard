// @ts-strict-ignore
import { DashboardCard } from "@dashboard/components/Card";
import Skeleton from "@dashboard/components/Skeleton";
import { ProductMediaFragment } from "@dashboard/graphql";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import React from "react";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  chooseMedia: {
    id: "2J6EFz",
    defaultMessage: "Choose media",
    description: "button",
  },
  media: {
    id: "/Mcvt4",
    defaultMessage: "Media",
    description: "section header",
  },
  selectSpecificVariant: {
    id: "JfKvrV",
    defaultMessage: "Select a specific variant media from product media",
    description: "select variant media",
  },
});

interface ProductVariantMediaProps {
  media?: ProductMediaFragment[];
  placeholderImage?: string;
  disabled: boolean;
  onImageAdd: () => any;
}

export const ProductVariantMedia: React.FC<
  ProductVariantMediaProps
> = props => {
  const intl = useIntl();
  const { disabled, media, onImageAdd } = props;

  return (
    <DashboardCard>
      <DashboardCard.Title>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {intl.formatMessage(messages.media)}
          <Button
            size="small"
            variant="secondary"
            disabled={disabled}
            onClick={onImageAdd}
          >
            {intl.formatMessage(messages.chooseMedia)}
          </Button>
        </Box>
      </DashboardCard.Title>
      <DashboardCard.Content>
        <Box display="grid" gap={2} __gridTemplateColumns="repeat(4, 1fr)">
          {media === undefined || media === null ? (
            <Skeleton />
          ) : media.length > 0 ? (
            media
              .sort((prev, next) => (prev.sortOrder > next.sortOrder ? 1 : -1))
              .map(mediaObj => {
                const parsedMediaOembedData = JSON.parse(mediaObj?.oembedData);
                const mediaUrl =
                  parsedMediaOembedData?.thumbnail_url || mediaObj.url;
                return (
                  <Box
                    as="img"
                    width="100%"
                    objectFit="contain"
                    key={mediaObj.id}
                    src={mediaUrl}
                    alt={mediaObj.alt}
                  />
                );
              })
          ) : (
            <Text __gridColumnEnd="span 4" variant="caption" size="large">
              {intl.formatMessage(messages.selectSpecificVariant)}
            </Text>
          )}
        </Box>
      </DashboardCard.Content>
    </DashboardCard>
  );
};
ProductVariantMedia.displayName = "ProductVariantMedia";
export default ProductVariantMedia;
