package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;
import java.util.Calendar;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Calendar object and JSON string.
 * @author huangchao
 */
public class CalendarSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {Calendar.class};

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        return new StringBuffer("new Date(").append(((Calendar) obj).getTimeInMillis()).append(")").toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            if (json.nextToken() == Tokener.CHARACTERS && json.isDate())
            {
                Calendar result = Calendar.getInstance();
                result.setTimeInMillis(Long.parseLong(json.getTokenText()));
                return result;
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("204");  // can not convert JSON string to calendar object
    }
}
