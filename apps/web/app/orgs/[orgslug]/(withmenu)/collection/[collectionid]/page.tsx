import GeneralWrapperStyled from "@components/StyledElements/Wrappers/GeneralWrapper";
import { getAccessTokenFromRefreshTokenCookie, getNewAccessTokenUsingRefreshTokenServer } from "@services/auth/auth";
import { getBackendUrl, getUriWithOrg } from "@services/config/config";
import { getCollectionByIdWithAuthHeader } from "@services/courses/collections";
import { getCourseThumbnailMediaDirectory } from "@services/media/media";
import { getOrganizationContextInfo } from "@services/organizations/orgs";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

type MetadataProps = {
  params: { orgslug: string, courseid: string, collectionid: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: MetadataProps,
): Promise<Metadata> {
  const cookieStore = cookies();
  const access_token = await getAccessTokenFromRefreshTokenCookie(cookieStore)

  // Get Org context information 
  const org = await getOrganizationContextInfo(params.orgslug, { revalidate: 1800, tags: ['organizations'] });
  const col = await getCollectionByIdWithAuthHeader(params.collectionid, access_token ? access_token : null, { revalidate: 0, tags: ['collections'] });

  // SEO
  return {
    title: `Collection : ${col.name}  — ${org.name}`,
    description: `${col.description} `,
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      }
    },
    openGraph: {
      title: `Collection : ${col.name}  — ${org.name}`,
      description: `${col.description} `,
      type: 'website',
    },
  };
}

const CollectionPage = async (params: any) => {
  const cookieStore = cookies();
  const access_token = await getAccessTokenFromRefreshTokenCookie(cookieStore)
  const org = await getOrganizationContextInfo(params.params.orgslug, { revalidate: 1800, tags: ['organizations'] });
  const orgslug = params.params.orgslug;
  const col = await getCollectionByIdWithAuthHeader(params.params.collectionid, access_token ? access_token : null, { revalidate: 0, tags: ['collections'] });

  const removeCoursePrefix = (courseid: string) => {
    return courseid.replace("course_", "")
  }


  return <GeneralWrapperStyled>
    <h2 className="text-sm font-bold text-gray-400">Collection</h2>
    <h1 className="text-3xl font-bold">{col.name}</h1>
    <br />
    <div className="home_courses flex flex-wrap">
      {col.courses.map((course: any) => (
        <div className="pr-8" key={course.course_uuid}>
          <Link href={getUriWithOrg(orgslug, "/course/" + removeCoursePrefix(course.course_uuid))}>
            <div className="inset-0 ring-1 ring-inset ring-black/10 rounded-lg shadow-xl relative w-[249px] h-[131px] bg-cover" style={{ backgroundImage: `url(${getCourseThumbnailMediaDirectory(org.org_uuid, course.course_uuid, course.thumbnail_image)})` }}>
            </div>
          </Link>
          <h2 className="font-bold text-lg w-[250px] py-2">{course.name}</h2>
        </div>
      ))}
    </div>



  </GeneralWrapperStyled>;
};

export default CollectionPage;